const express = require("express");
const router = express.Router();
const util = require("./utils/util");
const validUtil = require("./utils/validUtil");

const nameLenRange = [4, 20];
const caloriesRange = [0, 10000];
const macroRange = [0, 10000];
const costRange = [0, 10000];
const servSizeRange = [0, 10000];
const servSizeUnitRange = [7, 11];
const iconNumRange = [2, 2];
const categoryNumRange = [1, 12];

const validateItemInputs = (body, initial) => {
    let name = validUtil.validateString("Name", body.name, initial, nameLenRange, true, false, false, false, false);
    if (name.valid === -1) throw Error(name.msg);

    let calories = validUtil.validateNum("Calories", body.calories, initial, caloriesRange);
    if (calories.valid === -1) throw Error(calories.msg);
    let protein = validUtil.validateNum("Protein", body.protein, initial, macroRange);
    if (protein.valid === -1) throw Error(protein.msg);
    let carbs = validUtil.validateNum("Carbs", body.carbs, initial, macroRange);
    if (carbs.valid === -1) throw Error(carbs.msg);
    let fat = validUtil.validateNum("Fat", body.fat, initial, macroRange);
    if (fat.valid === -1) throw Error(fat.msg);
    let cost = validUtil.validateNum("Cost", body.cost, initial, costRange);
    if (cost.valid === -1) throw Error(cost.msg);
    let servSize = validUtil.validateNum("Serving Size", body.serving_size, initial, servSizeRange);
    if (servSize.valid === -1) throw Error(servSize.msg);
    let servSizeIdx = validUtil.validateNum("Serving Size Unit Index", body.serving_size_unit_fk, initial, servSizeUnitRange);
    if (servSizeIdx.valid === -1) throw Error(servSizeIdx.msg);
    let iconIdx = validUtil.validateNum("Icon Index", body.icon_fk, initial, iconNumRange);
    if (iconIdx.valid === -1) throw Error(iconIdx.msg);
    let catIdx = validUtil.validateNum("Category Index", body.category_fk, initial, categoryNumRange);
    if (catIdx.valid === -1) throw Error(catIdx.msg);
};

const verifyUser = async (req, id) => {
    let sql = `SELECT * FROM item WHERE id = ${id}`;

    let item = await req.conn.queryAsync(sql);
    if (item[0].user_fk != req.user.id) throw Error("You can only modify your own items.");
};

//---------
//
//   GET
//
//---------

// Get all user's items
router.get("/", async (req, res) => {
    const query = req.query;
    const limit = query.limit || 10;
    const offset = query.offset || 0;

    let sql = `
        SELECT *
        FROM item
        WHERE user_fk = ${req.user.id}
        LIMIT ${limit}
        OFFSET ${offset}
    `;

    try {
        let items = await req.conn.queryAsync(sql);

        util.cleanup(req.conn);
        res.json({ items });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Get item by id
router.get("/:id/single/", async (req, res) => {
    const params = req.params;

    let sql = `
        SELECT *
        FROM item
        WHERE id = ${params.id}
    `;

    try {
        let item = await req.conn.queryAsync(sql);
        item = item[0];

        util.cleanup(req.conn);
        res.json({ item });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Search for items with query param
router.get("/search/", async (req, res) => {
    const query = req.query;
    const limit = query.limit || 10;
    const offset = query.offset || 0;

    let sql = `
        SELECT *
        FROM item
        WHERE name REGEXP '${query.str}'
        LIMIT ${limit}
        OFFSET ${offset}
    `;

    try {
        let results = await req.conn.queryAsync(sql);

        util.cleanup(req.conn);
        res.json({ results });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Search for items with query param and category
router.get("/search/category/:catId/", async (req, res) => {
    const query = req.query;
    const params = req.params;
    const limit = query.limit || 10;
    const offset = query.offset || 0;

    let sql = `
        SELECT *
        FROM item
        WHERE name REGEXP '${query.str}' AND category_fk = ${params.catId}
        LIMIT ${limit}
        OFFSET ${offset}
    `;

    try {
        let results = await req.conn.queryAsync(sql);

        util.cleanup(req.conn);
        res.json({ results });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Get items by category id with limits and offset params
router.get("/category/:catId/", async (req, res) => {
    const params = req.params;
    const query = req.query;
    const limit = query.limit || 10;
    const offset = query.offset || 0;

    let sql = `
        SELECT *
        FROM item
        WHERE category_fk = ${params.catId}
        LIMIT ${limit}
        OFFSET ${offset}
    `;

    try {
        let results = await req.conn.queryAsync(sql);

        util.cleanup(req.conn);
        res.json({ results });
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

// Add an item to global list
router.post("/", async (req, res) => {
    const body = req.body;

    let sql = `
        INSERT
        INTO item (
            name,
            calories,
            protein,
            carbs,
            fat,
            cost,
            serving_size,
            serving_size_unit_fk,
            icon_fk,
            category_fk,
            user_fk)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        validateItemInputs(body, true);

        let existingItem = await req.conn.queryAsync(`SELECT * FROM item WHERE name = '${body.name}'`);
        if (existingItem.length > 0) {
            util.cleanup(req.conn);
            res.json({ alreadyExists: existingItem[0] });
            return;
        }

        let okPacket = await req.conn.queryAsync(sql, [
            body.name,
            body.calories,
            body.protein,
            body.carbs,
            body.fat,
            body.cost,
            body.serving_size,
            body.serving_size_unit_fk,
            body.icon_fk,
            body.category_fk,
            req.user.id,
        ]);

        util.cleanup(req.conn);
        res.json({ success: "item has been created", id: okPacket.insertId });
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

// Update an item
router.put("/:id/", async (req, res) => {
    const body = req.body;
    const params = req.params;

    try {
        await verifyUser(req, params.id);
        validateItemInputs(body, false);

        let updateStr = util.getUpdateStr(body, ["serving_size", "serving_size_unit_fk", "category_fk"], []);
        if (updateStr.affected) throw Error("Cannot modify these attributes.");

        let sql = `
            UPDATE item
            SET ${updateStr.valueStr}
            WHERE id = ${params.id}
        `;

        let okPacket = await req.conn.queryAsync(sql, updateStr.values);

        util.cleanup(req.conn);
        res.json({ success: "item has been updated" });
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

router.delete("/:id/", async (req, res) => {
    const params = req.params;

    let delete_sql = `
        DELETE FROM meal_item WHERE item_fk = ${params.id};
        DELETE FROM item WHERE id = ${params.id}
    `;

    try {
        await verifyUser(req, params.id);

        let sqlArr = delete_sql.split(";");

        await util.runMultipleLinesOfSql(req, sqlArr, "Error with deleting item.");

        util.cleanup(req.conn);
        res.json({ success: "Item has been deleted." });
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
    res.status(404).json({ error: "Requested item endpoint does not exist." });
});

module.exports = router;
