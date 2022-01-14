const express = require("express");
const router = express.Router();
const util = require("./utils/util");
const liftUtil = require("./utils/liftUtil");
const validUtil = require("./utils/validUtil");

// Days of week:
// U: Sunday
// M: Monday
// T: Tuesday
// W: Wednesday
// R: Thursday
// F: Friday
// S: Saturday
const daysArr = ["M", "T", "W", "R", "F", "S", "U"];

const nameLenRange = [1, 20];
const workoutNameRange = [1, 20];
const descRange = [1, 200];
const daysRange = [1, 7];
const unitNumRange = [1, 2];
const starredRange = [0, 1];

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

    let desc = validUtil.validateString("Description", body.description, false, descRange, true, false, false, false, false);
    if (desc.valid === -1) throw Error(desc.msg);

    let days = validUtil.validateString("Days String", body.days, false, daysRange, true, false, false, false, false);
    if (days.valid === -1) throw Error(days.msg);

    if (body.days) {
        body.days = body.days.toUpperCase();
        for (let i = 0; i < body.days.length; i++) {
            if (!daysArr.includes(body.days.charAt(i))) throw Error("Invalid day character.");
        }
    }
};

const validateLiftInputs = (body, initial) => {
    let name = validUtil.validateString("Name", body.name, initial, nameLenRange, true, false, false, false, false);
    if (name.valid === -1) throw Error(name.msg);

    let unitIdx = validUtil.validateNum("Unit index", body.unit_fk, initial, unitNumRange);
    if (unitIdx.valid === -1) throw Error(unitIdx.msg);

    let starred = validUtil.validateNum("Starred", body.starred, initial, starredRange);
    if (starred.valid === -1) throw Error(starred.msg);
};

//---------
//
//   GET
//
//---------

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

        util.cleanup(req.conn);
        res.json({ workouts });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Get a workout and all of its lifts (id -1 yields all lifts without workout)
router.get("/workout/:id/", async (req, res) => {
    const params = req.params;
    let pId = parseInt(params.id);

    let whereClause = `= ${params.id}`;
    if (pId === -1) whereClause = `IS NULL`;

    let sql = `
        SELECT id
        FROM lift
        WHERE workout_fk ${whereClause}
    `;

    try {
        if (pId !== -1) await verifyUserWorkout(req, params.id);
        let workout = -1;
        if (pId !== -1) workout = await liftUtil.getWorkoutInfo(req, params.id);
        let lifts = await req.conn.queryAsync(sql);

        let liftArray = [];

        for (let i = 0; i < lifts.length; i++) {
            liftArray.push(await liftUtil.getLiftInfo(req, lifts[i].id));
        }

        util.cleanup(req.conn);
        res.json({ workout, liftArray });
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

// Get a set, either date or latest param, default will be latest = 1
router.get("/:id/set/", async (req, res) => {
    const query = req.query;
    const params = req.params;

    let date = query.date || null;
    let latest = query.latest;

    let sqlDate = `
        SELECT *
        FROM lift_set_parent
        WHERE lift_fk = ${params.id} AND date = ?
    `;

    let sqlLatest = `
        SELECT *
        FROM lift_set_parent
        WHERE lift_fk = ${params.id}
        ORDER BY date DESC
        LIMIT ?
    `;

    let sqlSets = `
        SELECT *
        FROM lift_set
        WHERE lift_set_parent_fk = ?
        ORDER BY set_num ASC
    `;

    try {
        await verifyUserLift(req, params.id);

        let setParent = null;
        let sets = [];

        if (date && latest) throw Error("Invalid, select either date or latest.");
        else if (date) {
            setParent = await req.conn.queryAsync(sqlDate, [date]);
        } else {
            if (!latest) latest = 1;
            setParent = await req.conn.queryAsync(sqlLatest, [latest]);
        }

        if (setParent && setParent.length !== 0) {
            setParent = setParent[0];
            sets = await req.conn.queryAsync(sqlSets, [setParent.id]);
        } else {
            setParent = null;
        }

        util.cleanup(req.conn);
        res.json({ setParent, sets });
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

        let okPacket = await req.conn.queryAsync(sql, [body.name, body.description, body.days, req.user.id]);

        util.cleanup(req.conn);
        res.json({ success: "workout has been created", id: okPacket.insertId });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Create a lift
router.post("/", async (req, res) => {
    const body = req.body;

    let sql = `
        INSERT
        INTO lift (
            name,
            unit_fk,
            user_fk,
            workout_fk,
            starred)
        VALUES (?, ?, ?, ?, ?)
    `;

    try {
        validateLiftInputs(body, true);
        let wFK = body.workout_fk !== -1 ? body.workout_fk : null;
        if (wFK !== null) await verifyUserWorkout(req, wFK);

        let okPacket = await req.conn.queryAsync(sql, [body.name, body.unit_fk, req.user.id, wFK, body.starred]);

        if (wFK !== null) await liftUtil.updateLiftCnt(req, wFK);

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

    let parentSql = `
        INSERT
        INTO lift_set_parent (
            set_quantity,
            top_set,
            date,
            lift_fk)
        VALUES (?, ?, ?, ?)
    `;

    let sql = `
        INSERT
        INTO lift_set (
            set_num,
            weight,
            reps,
            theomax,
            lift_set_parent_fk,
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
        let setLen = sets.length;

        let topSet = validUtil.validateNum("Top set", body.top_set, false, [1, setLen]);
        if (topSet.valid === -1) throw Error(topSet.msg);

        let okPackets = [];
        let updateNeccessary = false;

        let liftInfo = await liftUtil.getLiftInfo(req, params.id);

        let parentOkPacket = await req.conn.queryAsync(parentSql, [setLen, body.top_set, body.date, params.id]);

        for (let i = 0; i < sets.length; i++) {
            let weight = sets[i][0];
            let reps = sets[i][1];
            if (reps > 30 || reps < 1) throw Error("Reps must be 1-30");

            let args = [i + 1, weight, reps];
            args.push(liftUtil.getTheoMax(weight, reps));
            args.push(parentOkPacket.insertId);
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

        let wId = body.workout_fk;

        let updateStr = util.getUpdateStr(body, ["workout_fk"]);
        if (updateStr.affected) {
            if (wId !== -1) await verifyUserWorkout(req, wId);
            else {
                wId = await req.conn.queryAsync(`SELECT workout_fk FROM lift WHERE id = ${params.id}`);
                wId = wId[0].workout_fk;
                let widIdx = updateStr.values.indexOf(-1);
                updateStr.values[widIdx] = null;
            }
        }

        let sql = `
            UPDATE lift
            SET ${updateStr.valueStr}
            WHERE id = ${params.id}
        `;

        let okPacket = await req.conn.queryAsync(sql, updateStr.values);

        if (updateStr.affected) await liftUtil.updateLiftCnt(req, wId);

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

        let sets = body.sets;
        let setLen = sets ? sets.length : 0;

        let oldDateSet = await liftUtil.checkExistingLiftSet(req, params.id, body.oldDate);
        if (oldDateSet.length === 0) throw Error("No set exists at old date");
        oldDateSet = oldDateSet[0];

        if (sets && setLen !== oldDateSet.set_quantity) throw Error("Number of sets do not match.");

        if (body.date) {
            let newDateSet = await liftUtil.checkExistingLiftSet(req, params.id, body.date);
            if (newDateSet.length > 0) throw Error("A set already exists at this date.");
        }

        let okPackets = [];

        if (body.date || body.top_set) {
            let updateObj = {};
            if (body.date) updateObj.date = body.date;
            if (body.top_set) updateObj.top_set = body.top_set;

            let parentUpdateString = util.getUpdateStr(updateObj, ["top_set"]);
            if (parentUpdateString.affected) {
                if (body.top_set === -1) {
                    let tsIdx = parentUpdateString.values.indexOf(-1);
                    parentUpdateString.values[tsIdx] = null;
                }
            }

            let parentSql = `
                UPDATE lift_set_parent
                SET ${parentUpdateString.valueStr}
                WHERE lift_fk = ${params.id} AND date = '${body.oldDate}'
            `;

            let parentOkPacket = await req.conn.queryAsync(parentSql, parentUpdateString.values);
        }

        for (let i = 0; i < setLen; i++) {
            let setBody = {};

            if (!sets[i]) {
                continue;
            } else {
                setBody.weight = sets[i][0];
                setBody.reps = sets[i][1];
                setBody.theomax = liftUtil.getTheoMax(setBody.weight, setBody.reps);
            }

            let updateStr = util.getUpdateStr(setBody, []);

            let sql = `
                UPDATE lift_set
                SET ${updateStr.valueStr}
                WHERE lift_set_parent_fk = ${oldDateSet.id} AND set_num = ${i + 1}
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

// Modify a workout
router.put("/workout/:id/", async (req, res) => {
    const body = req.body;
    const params = req.params;

    try {
        await verifyUserWorkout(req, params.id);
        validateWorkoutInputs(body, false);

        let updateStr = util.getUpdateStr(body, []);

        let sql = `
            UPDATE workout
            SET ${updateStr.valueStr}
            WHERE id = ${params.id}
        `;

        let okPacket = await req.conn.queryAsync(sql, updateStr.values);

        util.cleanup(req.conn);
        res.json({ success: "workout has been updated" });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

//------------
//
//   DELETE
//
//------------

// Delete a workout
router.delete("/workout/:id/", async (req, res) => {
    const params = req.params;
    let keepLift = req.query.keepLift;
    if (keepLift === "false") keepLift = false;

    let delete_lift_sql = `
        DELETE FROM lift_set WHERE lift_fk = ?;
        DELETE FROM lift_set_parent WHERE lift_fk = ?
    `;

    let delete_sql = `
        DELETE FROM lift WHERE workout_fk = ${params.id};
        DELETE FROM workout WHERE id = ${params.id}
    `;

    try {
        await verifyUserWorkout(req, params.id);

        let sqlArr = delete_sql.split(";");

        if (keepLift) {
            await req.conn.queryAsync(`UPDATE lift SET workout_fk = null WHERE workout_fk = ${params.id}`);

            await req.conn.queryAsync(sqlArr[1]);
        } else {
            let liftIDs = await req.conn.queryAsync(`SELECT id FROM lift WHERE workout_fk = ${params.id}`);

            for (let i = 0; i < liftIDs.length; i++) {
                let updatedDelete = delete_lift_sql.replace(/\?/g, liftIDs[i].id);
                let liftSqlArr = updatedDelete.split(";");
                await util.runMultipleLinesOfSql(req, liftSqlArr, "Error deleting lifts from workout.");
            }

            await util.runMultipleLinesOfSql(req, sqlArr, "Error deleting workout.");
        }

        util.cleanup(req.conn);
        res.json({ success: "Workout has been deleted." });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Delete lift
router.delete("/:id/", async (req, res) => {
    const params = req.params;

    let infoSql = `
        SELECT workout_fk
        FROM lift
        WHERE id = ${params.id}
    `;

    let delete_sql = `
        DELETE FROM lift_set WHERE lift_fk = ${params.id};
        DELETE FROM lift_set_parent WHERE lift_fk = ${params.id};
        DELETE FROM lift WHERE id = ${params.id}
    `;

    try {
        await verifyUserLift(req, params.id);

        let wId = await req.conn.queryAsync(infoSql);

        let sqlArr = delete_sql.split(";");

        await util.runMultipleLinesOfSql(req, sqlArr, "Error deleting lift.");

        if (wId[0].workout_fk !== null) await liftUtil.updateLiftCnt(req, wId[0].workout_fk);

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

    let infoSql = `
        SELECT id
        FROM lift_set_parent
        WHERE lift_fk = ${params.id} AND date = '${body.date}'
    `;

    let parent_delete_sql = `
        DELETE FROM lift_set_parent WHERE lift_fk = ${params.id} AND date = '${body.date}'
    `;

    let delete_sql = `
        DELETE FROM lift_set WHERE lift_set_parent_fk = ?
    `;

    try {
        await verifyUserLift(req, params.id);

        let parentID = await req.conn.queryAsync(infoSql);
        if (parentID.length === 0) throw Error("Parent set not found.");

        await req.conn.queryAsync(delete_sql, [parentID[0].id]);
        await req.conn.queryAsync(parent_delete_sql);

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
