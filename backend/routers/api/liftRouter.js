const express = require("express");
const router = express.Router();
const util = require("./utils/util");
const liftUtil = require("./utils/liftUtil");
const validUtil = require("./utils/validUtil");

// Days of week:
// M: Monday
// T: Tuesday
// W: Wednesday
// R: Thursday
// F: Friday
// S: Saturday
// U: Sunday
const daysArr = ["M", "T", "W", "R", "F", "S", "U"];

const nameLenRange = [1, 20];
const workoutNameRange = [1, 20];
const descRange = [1, 200];
const daysRange = [1, 7];
const unitNumRange = [1, 2];

const verifyUserLift = async (req, id) => {
    let sql = `SELECT * FROM lift WHERE id = ${id}`;

    let lift = await req.conn.queryAsync(sql);
    if (lift.length === 0) throw Error("This lift does not exist.");
    if (lift[0].user_fk !== req.user.id) throw Error("You can only modify your own lifts.");
};

const verifyUserWorkout = async (req, id) => {
    let sql = `SELECT * FROM workout WHERE id = ${id}`;

    let workout = await req.conn.queryAsync(sql);
    if (workout.length === 0) throw Error("This workout does not exist.");
    if (workout[0].user_fk !== req.user.id) throw Error("You can only modify your own workouts.");
};

const validateWorkoutInputs = (body, initial) => {
    let name = validUtil.validateString("Name", body.name, initial, workoutNameRange, true, false, false, false, false);
    if (name.valid === -1) throw Error(name.msg);

    let desc = validUtil.validateString("Description", body.desc, false, descRange, true, false, false, false, false);
    if (desc.valid === -1) throw Error(desc.msg);

    body.days = body.days.toUpperCase();
    let days = validUtil.validateString("Days String", body.days, false, daysRange, true, false, false, false, false);
    if (days.valid === -1) throw Error(days.msg);
    for (let i = 0; i < days.length; i++) {
        if (!daysArr.includes(days.charAt(i))) throw Error("Invalid day character.");
    }
};

const validateLiftInputs = (body, initial) => {
    let name = validUtil.validateString("Name", body.name, initial, nameLenRange, true, false, false, false, false);
    if (name.valid === -1) throw Error(name.msg);

    let unitIdx = validUtil.validateNum("Unit index", body.unit_fk, initial, unitNumRange);
    if (unitIdx.valid === -1) throw Error(unitIdx.msg);
};

//---------
//
//   GET
//
//---------

// TODO:
// Get all workouts
router.get("/workout/", async (req, res) => {
    const query = req.query;
    const limit = query.limit || 10;
    const offset = query.offset || 0;

    let sql = `
        SELECT
            id,
            name,
            description,
            days,
            liftCnt,
            created_at
        FROM workout
        WHERE user_fk = ${req.user.id}
        LIMIT ${limit}
        OFFSET ${offset}
    `;

    try {
        let workouts = await req.conn.queryAsync(sql);

        // let workoutArray = [];

        // for (let i = 0; i < workouts.length; i++) {
        //     workoutArray.push(await liftUtil.getWorkoutInfo(req, workouts[i].id));
        // }

        util.cleanup(req.conn);
        res.json({ workouts });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// TODO:
// Get a workout and all of its lifts
router.get("/workout/:id/", async (req, res) => {
    const params = req.params;
    let whereClause = `= ${params.id}`;
    if (params.id === -1) whereClause = `IS NULL`;

    let sql = `
        SELECT id
        FROM lift
        WHERE workout_fk ${whereClause}
    `;

    try {
        if (params.id !== -1) await verifyUserWorkout(req, params.id);
        let lifts = await req.conn.queryAsync(sql);

        let liftArray = [];

        for (let i = 0; i < lifts.length; i++) {
            liftArray.push(await liftUtil.getLiftInfo(req, lifts[i].id));
        }

        util.cleanup(req.conn);
        res.json({ liftArray });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Get all user's lifts
router.get("/", async (req, res) => {
    const query = req.query;
    const limit = query.limit || 10;
    const offset = query.offset || 0;

    let sql = `
        SELECT id
        FROM lift
        WHERE user_fk = ${req.user.id}
        LIMIT ${limit}
        OFFSET ${offset}
    `;

    try {
        let lifts = await req.conn.queryAsync(sql);

        let liftArray = [];

        for (let i = 0; i < lifts.length; i++) {
            liftArray.push(await liftUtil.getLiftInfo(req, lifts[i].id));
        }

        util.cleanup(req.conn);
        res.json({ liftArray });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Get lift by id
router.get("/:id/single/", async (req, res) => {
    const params = req.params;

    try {
        await verifyUserLift(req, params.id);

        let liftInfo = await liftUtil.getLiftInfo(req, params.id);

        let liftSets = await liftUtil.getLiftSets(req, liftInfo.id);

        util.cleanup(req.conn);
        res.json({ liftInfo, liftSets });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Get a set
router.get("/:id/set/", async (req, res) => {
    const query = req.query;
    const params = req.params;

    let sql = `
        SELECT *
        FROM lift_set
        WHERE lift_fk = ${params.id} AND date = '${query.date}'
        ORDER BY set_num
    `;

    try {
        await verifyUserLift(req, params.id);

        let set = await req.conn.queryAsync(sql);

        util.cleanup(req.conn);
        res.json({ set });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

//----------
//
//   POST
//
//----------

// TODO:
// Create a workout
router.post("/workout/", async (req, res) => {
    const body = req.body;

    let sql = `
        INSERT
        INTO workout (
            name,
            description,
            days,
            user_fk)
        VALUES (?, ?, ?, ?)
    `;

    try {
        validateWorkoutInputs(body, true);

        let okPacket = await req.conn.queryAsync(sql, [body.name, body.unit_fk, req.user.id]);

        util.cleanup(req.conn);
        res.json({ success: "lift has been created", id: okPacket.insertId });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// TODO: create an option to add lift to workout right away or null
// Create a lift
router.post("/", async (req, res) => {
    const body = req.body;

    let sql = `
        INSERT
        INTO lift (
            name,
            unit_fk,
            user_fk)
        VALUES (?, ?, ?)
    `;

    try {
        validateLiftInputs(body, true);

        let okPacket = await req.conn.queryAsync(sql, [body.name, body.unit_fk, req.user.id]);

        util.cleanup(req.conn);
        res.json({ success: "lift has been created", id: okPacket.insertId });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Create a lift set
router.post("/:id/set/", async (req, res) => {
    const body = req.body;
    const params = req.params;

    let sql = `
        INSERT
        INTO lift_set (
            set_num,
            weight,
            reps,
            theomax,
            date,
            lift_fk)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
        await verifyUserLift(req, params.id);
        if (body.sets.length < 1) throw Error("Set array cannot be empty.");
        else if (body.sets.length > 10) throw Error("Set array max length is 10.");

        let newDateSet = await liftUtil.checkExistingLiftSet(req, params.id, body.date);
        if (newDateSet.length > 0) throw Error("A set already exists at this date.");

        let sets = body.sets;
        let okPackets = [];
        let updateNeccessary = false;

        let liftInfo = await liftUtil.getLiftInfo(req, params.id);

        for (let i = 0; i < sets.length; i++) {
            let weight = sets[i][0];
            let reps = sets[i][1];
            let args = [i + 1, weight, reps];
            args.push(liftUtil.getTheoMax(weight, reps));
            args.push(body.date);
            args.push(params.id);

            if (args[1] >= liftInfo.max || args[3] >= liftInfo.theomax) {
                updateNeccessary = true;
            }

            let okPacket = await req.conn.queryAsync(sql, args);
            okPackets.push(okPacket);
        }

        if (updateNeccessary) await liftUtil.updateLiftMax(req, params.id);

        util.cleanup(req.conn);
        res.json({ success: "lift set has been added" });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

//---------
//
//   PUT
//
//---------

// Update a lift
router.put("/:id/", async (req, res) => {
    const body = req.body;
    const params = req.params;

    try {
        await verifyUserLift(req, params.id);
        validateLiftInputs(body, false);

        let updateStr = util.getUpdateStr(body, []);

        let sql = `
            UPDATE lift
            SET ${updateStr.valueStr}
            WHERE id = ${params.id}
        `;

        let okPacket = await req.conn.queryAsync(sql, updateStr.values);

        util.cleanup(req.conn);
        res.json({ success: "lift has been updated" });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Edit a lift set
router.put("/:id/set/", async (req, res) => {
    const body = req.body;
    const params = req.params;

    try {
        await verifyUserLift(req, params.id);

        let oldDateSet = await liftUtil.checkExistingLiftSet(req, params.id, body.oldDate);
        if (oldDateSet.length === 0) throw Error("No set exists at old date");

        if (body.date) {
            let newDateSet = await liftUtil.checkExistingLiftSet(req, params.id, body.date);
            if (newDateSet.length > 0) throw Error("A set already exists at this date.");
        }

        if (body.sets.length !== oldDateSet.length) throw Error("Number of sets do not match.");

        let sets = body.sets;
        let okPackets = [];

        for (let i = 0; i < sets.length; i++) {
            let setBody = {};

            if (body.date) setBody.date = body.date;

            if (!sets[i]) {
                if (Object.keys(setBody).length === 0) continue;
            } else {
                setBody.weight = sets[i][0];
                setBody.reps = sets[i][1];
                setBody.theomax = liftUtil.getTheoMax(setBody.weight, setBody.reps);
            }

            let updateStr = util.getUpdateStr(setBody, []);

            let sql = `
                UPDATE lift_set
                SET ${updateStr.valueStr}
                WHERE lift_fk = ${params.id} AND set_num = ${i + 1} AND date = '${body.oldDate}'
            `;

            let okPacket = await req.conn.queryAsync(sql, updateStr.values);
            okPackets.push(okPacket);
        }

        await liftUtil.updateLiftMax(req, params.id);

        util.cleanup(req.conn);
        res.json({ success: "lift set has been updated" });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// TODO:
// Modify a workout
router.put("/workout/:id/", async (req, res) => {
    const params = req.params;
});

// TODO:
// Move lift from one workout to another
router.put("/workout/:id/", async (req, res) => {
    const params = req.params;
});

//------------
//
//   DELETE
//
//------------

// TODO:
// Remove lift from a workout
router.delete("/workout/lift/:id/", async (req, res) => {
    const params = req.params;
});

// TODO:
// Delete a workout
router.delete("/workout/:id/", async (req, res) => {
    const params = req.params;
});

// Delete lift
router.delete("/:id/", async (req, res) => {
    const params = req.params;

    let delete_sql = `
        DELETE FROM lift_set WHERE lift_fk = ${params.id};
        DELETE FROM lift WHERE id = ${params.id}
    `;

    try {
        await verifyUserLift(req, params.id);

        let sqlArr = delete_sql.split(";");

        await util.runMultipleLinesOfSql(req, sqlArr, "Error deleting lift.");

        util.cleanup(req.conn);
        res.json({ success: "Lift has been deleted." });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Delete lift set
router.delete("/:id/set/", async (req, res) => {
    const params = req.params;
    const body = req.body;

    let delete_sql = `
        DELETE FROM lift_set WHERE lift_fk = ${params.id} AND date = '${body.date}'
    `;

    try {
        await verifyUserLift(req, params.id);

        let sqlArr = delete_sql.split(";");

        await util.runMultipleLinesOfSql(req, sqlArr, "Error deleting lift set.");

        await liftUtil.updateLiftMax(req, params.id);

        util.cleanup(req.conn);
        res.json({ success: "Lift set has been deleted." });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

//---------
//
//   404
//
//---------

router.use((req, res) => {
    util.cleanup(req.conn);
    res.status(404).json({ error: "Requested lift endpoint does not exist." });
});

module.exports = router;
