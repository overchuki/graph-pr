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
const notesLenRange = [1, 50];

const verifyUserLift = async (req, id) => {
    let sql = `SELECT * FROM lift WHERE id = ${id}`;

    let lift = await req.conn.queryAsync(sql);
    if (lift.length === 0) throw Error("This lift does not exist.");
    if (lift[0].user_fk !== req.user.id) throw Error("You can only modify your own lifts.");

    return lift[0];
};

const verifyUserWorkout = async (req, id) => {
    let sql = `SELECT * FROM workout WHERE id = ${id}`;

    let workout = await req.conn.queryAsync(sql);
    if (workout.length === 0) throw Error("This workout does not exist.");
    if (workout[0].user_fk !== req.user.id) throw Error("You can only modify your own workouts.");

    return workout[0];
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
        ORDER BY id
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

// Get a workout and all of its lifts
router.get("/workout/:id/", async (req, res) => {
    const params = req.params;

    let liftSql = `
        SELECT
            l.id,
            l.name,
            u.plur_abbr,
            l.starred,
            lmax.weight AS max,
            lmax.reps AS max_reps,
            lpmax.date AS max_date,
            ltheo.theomax,
            ltheo.weight AS theomax_weight,
            ltheo.reps AS theomax_reps,
            lptheo.date AS theomax_date,
            l.created_at
        FROM workout_lift AS wl
        LEFT JOIN lift AS l ON wl.lift_fk = l.id
        LEFT JOIN lift_set AS lmax ON l.max_set = lmax.id
        LEFT JOIN lift_set_parent AS lpmax ON lmax.lift_set_parent_fk = lpmax.id
        LEFT JOIN lift_set AS ltheo ON l.theomax_set = ltheo.id
        LEFT JOIN lift_set_parent AS lptheo ON ltheo.lift_set_parent_fk = lptheo.id
        LEFT JOIN unit AS u ON l.unit_fk = u.id
        WHERE wl.workout_fk = ${params.id}
        ORDER BY wl.order_num DESC
    `;

    let wSql = `
        SELECT
            w.id,
            w.name,
            wl.order_num
        FROM workout_lift AS wl
        LEFT JOIN workout AS w ON wl.workout_fk = w.id
        WHERE lift_fk = ?
    `;

    try {
        let workout = await verifyUserWorkout(req, params.id);

        let lifts = await req.conn.queryAsync(liftSql);
        for (let i = 0; i < lifts.length; i++) {
            let workouts = await req.conn.queryAsync(wSql, [lifts[i].id]);
            lifts[i].workouts = workouts;
        }

        util.cleanup(req.conn);
        res.json({ workout, lifts });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Get all user's lifts
router.get("/", async (req, res) => {
    const query = req.query;
    const limit = query.limit || 40;
    const offset = query.offset || 0;

    let sql = `
        SELECT
            l.id,
            l.name,
            u.plur_abbr,
            l.starred,
            lmax.weight AS max,
            lmax.reps AS max_reps,
            lpmax.date AS max_date,
            ltheo.theomax,
            ltheo.weight AS theomax_weight,
            ltheo.reps AS theomax_reps,
            lptheo.date AS theomax_date,
            l.created_at
        FROM lift AS l
        LEFT JOIN lift_set AS lmax ON l.max_set = lmax.id
        LEFT JOIN lift_set_parent AS lpmax ON lmax.lift_set_parent_fk = lpmax.id
        LEFT JOIN lift_set AS ltheo ON l.theomax_set = ltheo.id
        LEFT JOIN lift_set_parent AS lptheo ON ltheo.lift_set_parent_fk = lptheo.id
        LEFT JOIN unit AS u ON l.unit_fk = u.id
        WHERE l.user_fk = ${req.user.id}
        LIMIT ${limit}
        OFFSET ${offset}
    `;

    let wSql = `
        SELECT
            w.id,
            w.name,
            wl.order_num
        FROM workout_lift AS wl
        LEFT JOIN workout AS w ON wl.workout_fk = w.id
        WHERE lift_fk = ?
    `;

    try {
        let lifts = await req.conn.queryAsync(sql);

        for (let i = 0; i < lifts.length; i++) {
            let combinedSet = await liftUtil.getLatestLiftSet(req, lifts[i].id, 1);
            if (combinedSet.setParent) lifts[i].lastSet = { parent: combinedSet.setParent, sets: combinedSet.sets };
            else lifts[i].lastSet = null;

            let wName = await req.conn.queryAsync(wSql, [lifts[i].id]);
            lifts[i].workouts = wName;
        }

        util.cleanup(req.conn);
        res.json({ lifts });
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
            const combinedSet = await liftUtil.getLatestLiftSet(req, params.id, latest);
            setParent = combinedSet.setParent;
            sets = combinedSet.sets;
        }

        if (setParent && setParent.length !== 0 && date) {
            setParent = setParent[0];
            sets = await req.conn.queryAsync(sqlSets, [setParent.id]);
        } else if (!setParent || setParent.length === 0) {
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
            starred)
        VALUES (?, ?, ?, ?)
    `;

    let wSql = `
        INSERT
        INTO workout_lift (
            lift_fk,
            workout_fk,
            order_num)
        VALUES (?, ?, ?)
    `;

    try {
        validateLiftInputs(body, true);
        let wFK = body.workout_fk !== -1 ? body.workout_fk : null;
        if (wFK !== null) {
            for (let i = 0; i < wFK.length; i++) {
                await verifyUserWorkout(req, wFK[i]);
            }
        }

        let okPacket = await req.conn.queryAsync(sql, [body.name, body.unit_fk, req.user.id, body.starred]);

        if (wFK !== null) {
            for (let i = 0; i < wFK.length; i++) {
                let curCount = await liftUtil.getLiftCnt(req, wFK[i]);
                await req.conn.queryAsync(wSql, [okPacket.insertId, wFK[i], curCount + 1]);
                await liftUtil.updateLiftCnt(req, wFK[i]);
            }
        }

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
            notes,
            top_set,
            date,
            lift_fk)
        VALUES (?, ?, ?, ?, ?)
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

        let topSet = validUtil.validateNum("Top set", parseInt(body.top_set), false, [1, setLen]);
        if (topSet.valid === -1) throw Error(topSet.msg);
        let notes = validUtil.validateString("Notes", body.notes, false, notesLenRange);
        if (notes.valid === -1) throw Error(notes.msg);

        let okPackets = [];
        let updateNeccessary = false;

        let liftInfo = await liftUtil.getLiftInfo(req, params.id);

        let parentOkPacket = await req.conn.queryAsync(parentSql, [setLen, body.notes, body.top_set, body.date, params.id]);

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

// Modify which workouts a lift is in
router.put("/:id/workout/", async (req, res) => {
    const liftID = req.params.id;
    const workoutIDs = req.body.workoutIDs;

    let wSql = `
        SELECT
            workout_fk,
            order_num
        FROM workout_lift
        WHERE lift_fk = ${liftID}
    `;

    let addSql = `
        INSERT
        INTO workout_lift (
            lift_fk,
            workout_fk,
            order_num)
        VALUES (?, ?, ?)
    `;

    let removeSql = `
        DELETE
        FROM workout_lift
        WHERE workout_fk = ? AND lift_fk = ?
    `;

    let removeModifySql = `
        UPDATE workout_lift
        SET order_num = order_num - 1
        WHERE workout_fk = ? AND order_num > ?
    `;

    try {
        await verifyUserLift(req, liftID);
        let modWorkouts = [];

        let curWorkouts = await req.conn.queryAsync(wSql);
        let curWIDs = [];
        for (let i = 0; i < curWorkouts.length; i++) {
            curWIDs.push(curWorkouts[i].workout_fk);
        }

        for (let i = 0; i < workoutIDs.length; i++) {
            if (!curWIDs.includes(workoutIDs[i])) {
                let cnt = await liftUtil.getLiftCnt(req, workoutIDs[i]);
                await req.conn.queryAsync(addSql, [liftID, workoutIDs[i], cnt + 1]);

                modWorkouts.push(workoutIDs[i]);
            } else {
                curWIDs.splice(curWIDs.indexOf(workoutIDs[i]), 1);
            }
        }

        for (let i = 0; i < curWIDs.length; i++) {
            await req.conn.queryAsync(removeSql, [curWIDs[i], liftID]);

            let order = curWorkouts.find((w) => w.workout_fk === curWIDs[i]).order_num;
            await req.conn.queryAsync(removeModifySql, [curWIDs[i], order]);

            modWorkouts.push(curWIDs[i]);
        }

        for (let i = 0; i < modWorkouts.length; i++) {
            await liftUtil.updateLiftCnt(req, modWorkouts[i]);
        }

        util.cleanup(req.conn);
        res.json({ success: "lift workouts have been updated" });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Change the order of the lifts in a workout
router.put("/workout/:id/order/", async (req, res) => {
    const workoutID = req.params.id;
    // order: [[lift_id, newOrder]]
    const order = req.body.order;

    let sql = `
        UPDATE workout_lift
        SET order_num = ?
        WHERE lift_fk = ? AND workout_fk = ?
    `;

    try {
        await verifyUserWorkout(req, workoutID);

        for (let i = 0; i < order.length; i++) {
            await req.conn.queryAsync(sql, [order[i][1], order[i][0], workoutID]);
        }

        util.cleanup(req.conn);
        res.json({ success: "workout lift order has been updated" });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Update a lift
router.put("/:id/", async (req, res) => {
    const body = req.body;
    const params = req.params;

    try {
        await verifyUserLift(req, params.id);
        validateLiftInputs(body, false);

        let wId = body.workout_fk;
        let prevWID = body.prevWID;

        let updateStr = util.getUpdateStr(body, ["workout_fk"], ["prevWID"], []);
        if (updateStr.affected) {
            if (!prevWID) throw Error("Please provide previous workout info.");
            if (prevWID !== -1) await verifyUserWorkout(req, prevWID);

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

        if (updateStr.affected) {
            if (wId !== -1) await liftUtil.updateLiftCnt(req, wId);
            if (prevWID !== -1) await liftUtil.updateLiftCnt(req, prevWID);
        }

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

        if (body.date || body.top_set || body.notes !== null) {
            let updateObj = {};
            if (body.date) updateObj.date = body.date;
            if (body.top_set) updateObj.top_set = body.top_set;
            if (body.notes !== null) updateObj.notes = body.notes;

            let parentUpdateString = util.getUpdateStr(updateObj, ["top_set"], []);
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

            let updateStr = util.getUpdateStr(setBody, [], []);

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

        let updateStr = util.getUpdateStr(body, [], []);

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

    let delete_sql = `
        DELETE FROM workout_lift WHERE workout_fk = ${params.id};
        DELETE FROM workout WHERE id = ${params.id}
    `;

    try {
        await verifyUserWorkout(req, params.id);

        let sqlArr = delete_sql.split(";");

        await util.runMultipleLinesOfSql(req, sqlArr, "Error deleting workout.");

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
        SELECT
            workout_fk,
            order_num
        FROM workout_lift
        WHERE lift_fk = ${params.id}
    `;

    let removeModifySql = `
        UPDATE workout_lift
        SET order_num = order_num - 1
        WHERE workout_fk = ? AND order_num > ?
    `;

    let delete_sql = `
        DELETE FROM lift_set WHERE lift_fk = ${params.id};
        DELETE FROM lift_set_parent WHERE lift_fk = ${params.id};
        DELETE FROM workout_lift WHERE lift_fk = ${params.id};
        DELETE FROM lift WHERE id = ${params.id}
    `;

    try {
        await verifyUserLift(req, params.id);

        let wId = await req.conn.queryAsync(infoSql);

        let sqlArr = delete_sql.split(";");

        await util.runMultipleLinesOfSql(req, sqlArr, "Error deleting lift.");

        for (let i = 0; i < wId.length; i++) {
            await req.conn.queryAsync(removeModifySql, [wId[i].workout_fk, wId[i].order_num]);
            await liftUtil.updateLiftCnt(req, wId[i].workout_fk);
        }

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
