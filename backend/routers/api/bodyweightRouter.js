const express = require("express");
const router = express.Router();
const util = require("./utils/util");
const bwUtil = require("./utils/bwUtil");
const dateUtil = require("./utils/dateUtil");
const validUtil = require("./utils/validUtil");

const weightIntRange = [1, 1000];

const validateBWInputs = (body, initial, tz) => {
    let weight = validUtil.validateNum("Weight", body.weight, initial, weightIntRange);
    if (weight.valid === -1) throw Error(weight.msg);
    let date = validUtil.validateDate("Date", dateUtil.getDateFromStr(body.date), initial, [
        dateUtil.getDateFromStr("18500101"),
        dateUtil.getDateByTZ(new Date(), tz),
    ]);
    if (date.valid === -1) throw Error(date.msg);
};

const verifyUser = async (req, id) => {
    let sql = `SELECT * FROM bodyweight WHERE id = ${id}`;

    let bw = await req.conn.queryAsync(sql);
    if (bw[0].user_fk != req.user.id) throw Error("You can only modify your own bodyweight.");
};

//---------
//
//   GET
//
//---------

// Get user's bodyweight with query params
router.get("/", async (req, res) => {
    const query = req.query;
    const limit = query.limit || null;
    const offset = query.offset || null;
    const order = query.order || true;

    let orderStr = "DESC";
    if (order === "false") orderStr = "ASC";

    let sql = `
        SELECT *
        FROM bodyweight
        WHERE user_fk = ${req.user.id}
        ORDER BY date ${orderStr}
    `;
    if (limit && offset) {
        sql += `
            LIMIT ${limit}
            OFFSET ${offset}
        `;
    }

    try {
        let bw = await req.conn.queryAsync(sql);

        util.cleanup(req.conn);
        res.json({ bw });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Get user's last bodyweight
router.get("/last/", async (req, res) => {
    try {
        let bw = await bwUtil.getLastBodyweight(req, req.user.id, dateUtil.getDateStrByTZ(new Date(), "", req.user.tz));

        util.cleanup(req.conn);
        res.json({ bw });
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

// Create a bodyweight entry
router.post("/", async (req, res) => {
    const body = req.body;

    let sql = `
        INSERT
        INTO bodyweight (
            weight,
            date,
            user_fk)
        VALUES (?, ?, ?)
    `;

    try {
        validateBWInputs(body, true, req.user.tz);
        let bwDate = await req.conn.queryAsync(`SELECT id FROM bodyweight WHERE user_fk = ${req.user.id} AND date = '${body.date}'`);
        if (bwDate.length > 0) throw Error("Bodyweight already set on this date.");

        let okPacket = await req.conn.queryAsync(sql, [body.weight, body.date, req.user.id]);

        let okPacket2 = await bwUtil.updateMaintenanceCal(req, req.user.id, body.date, req.user.tz);

        util.cleanup(req.conn);
        res.json({ success: "BW entry has been added", id: okPacket.insertId });
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

// Update a bw entry
router.put("/:id/", async (req, res) => {
    const body = req.body;
    const params = req.params;

    try {
        await verifyUser(req, params.id);
        validateBWInputs(body, false, req.user.tz);
        if (!(body.date == null)) {
            let bwDate = await req.conn.queryAsync(`SELECT id FROM bodyweight WHERE user_fk = ${req.user.id} AND date = '${body.date}'`);
            if (bwDate.length > 0) throw Error("Bodyweight already set on this date.");
        }

        let updateStr = util.getUpdateStr(body, []);

        let sql = `
            UPDATE bodyweight
            SET ${updateStr.valueStr}
            WHERE id = ${params.id}
        `;

        let okPacket = await req.conn.queryAsync(sql, updateStr.values);

        let updatedBW = await req.conn.queryAsync(`SELECT date FROM bodyweight WHERE id = ${params.id}`);

        let okPacket2 = await bwUtil.updateMaintenanceCal(req, req.user.id, dateUtil.getDateStr(updatedBW[0].date, ""), req.user.tz);

        util.cleanup(req.conn);
        res.json({ success: "BW entry has been updated" });
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

// Delete a bw entry
router.delete("/:id/", async (req, res) => {
    const params = req.params;

    let sql = `
        SELECT *
        FROM bodyweight
        WHERE id = ${params.id}
    `;

    try {
        await verifyUser(req, params.id);

        let bw = await req.conn.queryAsync(sql);

        let delete_sql = `
            DELETE FROM maintenance_calories WHERE user_fk = ${req.user.id} AND date = '${dateUtil.getDateStr(bw[0].date, "")}';
            DELETE FROM bodyweight WHERE id = ${params.id}
        `;

        let sqlArr = delete_sql.split(";");

        await util.runMultipleLinesOfSql(req, sqlArr, "Error with deleting bw entry.");

        util.cleanup(req.conn);
        res.json({ success: "BW entry has been deleted." });
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
    res.status(404).json({ error: "Requested bodyweight endpoint does not exist." });
});

module.exports = router;
