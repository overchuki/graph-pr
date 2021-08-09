const express = require("express");
const router = express.Router();
const serviceFunc = require("./serviceFunc");

const nameLenRange = [1, 20];
const unitNumRange = [1, 2];

const verifyUser = async (req, id) => {
    let sql = `SELECT * FROM lift WHERE id = ${id}`;

    let lift = await req.conn.queryAsync(sql);
    if (lift[0].user_fk != req.user.id) throw Error("You can only modify your own lifts.");
};

const validateLiftInputs = (body, initial) => {
    serviceFunc.checkValidStr("Name", body.name, initial, nameLenRange, true, false, false);
    serviceFunc.checkValidInt("Unit index", body.unit_fk, initial, unitNumRange);
};

//---------
//
//   GET
//
//---------

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
            liftArray.push(await serviceFunc.getLiftInfo(req, lifts[i].id));
        }

        res.send(liftArray);
    } catch (err) {
        const errors = serviceFunc.handleError(err);
        res.send({ error: errors });
    }
});

// Get lift by id
router.get("/:id/single/", async (req, res) => {
    const params = req.params;

    try {
        await verifyUser(req, params.id);

        let liftInfo = await serviceFunc.getLiftInfo(req, params.id);

        let liftSets = await serviceFunc.getLiftSets(req, liftInfo.id);

        res.send({ liftInfo, liftSets });
    } catch (err) {
        const errors = serviceFunc.handleError(err);
        res.send({ error: errors });
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
        await verifyUser(req, params.id);

        let set = await req.conn.queryAsync(sql);

        res.send(set);
    } catch (err) {
        const errors = serviceFunc.handleError(err);
        res.send({ error: errors });
    }
});

//----------
//
//   POST
//
//----------

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

        res.send({ success: "lift has been created", id: okPacket.insertId });
    } catch (err) {
        const errors = serviceFunc.handleError(err);
        res.send({ error: errors });
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
        await verifyUser(req, params.id);
        serviceFunc.checkValidStr("Set array", body.sets, true, [1, 10], false, false, false);
        let newDateSet = await serviceFunc.checkExistingLiftSet(req, params.id, body.date);
        if (newDateSet.length > 0) throw Error("A set already exists at this date.");

        let sets = body.sets;
        let okPackets = [];
        let updateNeccessary = false;

        let liftInfo = await serviceFunc.getLiftInfo(req, params.id);

        for (let i = 0; i < sets.length; i++) {
            let weight = sets[i][0];
            let reps = sets[i][1];
            let args = [i + 1, weight, reps];
            args.push(serviceFunc.getTheoMax(weight, reps));
            args.push(body.date);
            args.push(params.id);

            if (args[1] >= liftInfo.max || args[3] >= liftInfo.theomax) {
                updateNeccessary = true;
            }

            let okPacket = await req.conn.queryAsync(sql, args);
            okPackets.push(okPacket);
        }

        if (updateNeccessary) await serviceFunc.updateLiftMax(req, params.id);

        res.send({ success: "lift set has been added" });
    } catch (err) {
        const errors = serviceFunc.handleError(err);
        res.send({ error: errors });
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
        await verifyUser(req, params.id);
        validateLiftInputs(body, false);

        let updateStr = serviceFunc.getUpdateStr(body, []);

        let sql = `
            UPDATE lift
            SET ${updateStr.valueStr}
            WHERE id = ${params.id}
        `;

        let okPacket = await req.conn.queryAsync(sql, updateStr.values);

        res.send({ success: "lift has been updated" });
    } catch (err) {
        const errors = serviceFunc.handleError(err);
        res.send({ error: errors });
    }
});

// Edit a lift set
router.put("/:id/set/", async (req, res) => {
    const body = req.body;
    const params = req.params;

    try {
        await verifyUser(req, params.id);

        let oldDateSet = await serviceFunc.checkExistingLiftSet(req, params.id, body.oldDate);
        if (oldDateSet.length === 0) throw Error("No set exists at old date");

        if (body.date) {
            let newDateSet = await serviceFunc.checkExistingLiftSet(req, params.id, body.date);
            if (newDateSet.length > 0) throw Error("A set already exists at this date.");
        }

        if (body.sets.length != oldDateSet.length) throw Error("Number of sets do not match.");

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
                setBody.theomax = serviceFunc.getTheoMax(setBody.weight, setBody.reps);
            }

            let updateStr = serviceFunc.getUpdateStr(setBody, []);

            let sql = `
                UPDATE lift_set
                SET ${updateStr.valueStr}
                WHERE lift_fk = ${params.id} AND set_num = ${i + 1} AND date = '${body.oldDate}'
            `;

            let okPacket = await req.conn.queryAsync(sql, updateStr.values);
            okPackets.push(okPacket);
        }

        await serviceFunc.updateLiftMax(req, params.id);

        res.send({ success: "lift set has been updated" });
    } catch (err) {
        const errors = serviceFunc.handleError(err);
        res.send({ error: errors });
    }
});

//------------
//
//   DELETE
//
//------------

// Delete lift
router.delete("/:id/", async (req, res) => {
    const params = req.params;

    let delete_sql = `
        DELETE FROM lift_set WHERE lift_fk = ${params.id};
        DELETE FROM lift WHERE id = ${params.id}
    `;

    try {
        await verifyUser(req, params.id);

        let sqlArr = delete_sql.split(";");

        await serviceFunc.runMultipleLinesOfSql(req, sqlArr, "Error deleting lift.");

        res.send({ success: "Lift has been deleted." });
    } catch (err) {
        const errors = serviceFunc.handleError(err);
        res.send({ error: errors });
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
        await verifyUser(req, params.id);

        let sqlArr = delete_sql.split(";");

        await serviceFunc.runMultipleLinesOfSql(req, sqlArr, "Error deleting lift set.");

        await serviceFunc.updateLiftMax(req, params.id);

        res.send({ success: "Lift set has been deleted." });
    } catch (err) {
        const errors = serviceFunc.handleError(err);
        res.send({ error: errors });
    }
});

//---------
//
//   404
//
//---------

router.use((req, res) => {
    res.status(404).send({ error: "Requested lift endpoint does not exist." });
});

module.exports = router;
