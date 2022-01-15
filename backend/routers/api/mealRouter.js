const express = require("express");
const router = express.Router();
const util = require("./utils/util");
const mealUtil = require("./utils/mealUtil");
const dateUtil = require("./utils/dateUtil");
const validUtil = require("./utils/validUtil");

const nameLenRange = [4, 20];
const descLenRange = [1, 100];

const validateMealInputs = (body, initial) => {
    let name = validUtil.validateString("Name", body.name, initial, nameLenRange, true, false, false, false, false);
    if (name.valid === -1) throw Error(name.msg);
    let desc = validUtil.validateString("Description", body.description, false, descLenRange, true, false, false, false, false);
    if (desc.valid === -1) throw Error(desc.msg);
};

const verifyUser = async (req, id) => {
    let sql = `SELECT * FROM meal WHERE id = ${id}`;

    let meal = await req.conn.queryAsync(sql);
    if (meal[0].user_fk != req.user.id) throw Error("You can only modify your own meals.");
};

//---------
//
//   GET
//
//---------

// Get all user's meals
router.get("/", async (req, res) => {
    const query = req.query;
    const limit = query.limit || 10;
    const offset = query.offset || 0;

    let sql = `
        SELECT *
        FROM meal
        WHERE user_fk = ${req.user.id}
        LIMIT ${limit}
        OFFSET ${offset}
    `;

    try {
        let meals = await req.conn.queryAsync(sql);

        util.cleanup(req.conn);
        res.json({ meals });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Get meal by id
router.get("/:id/single/", async (req, res) => {
    const params = req.params;

    let sqlMeal = `
        SELECT
            id,
            name,
            description,
            created_at
        FROM meal
        WHERE id = ${params.id}
    `;

    try {
        let meal = await req.conn.queryAsync(sqlMeal);
        if (meal.length === 0) throw Error("Requested meal does not exist.");
        meal = meal[0];

        let mealItems = await mealUtil.getMealItems(req, meal.id);

        let mealTotals = await mealUtil.getMealTotals(req, meal.id);

        util.cleanup(req.conn);
        res.json({ meal, mealTotals, mealItems });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Search for meals with query param
router.get("/search/", async (req, res) => {
    const query = req.query;
    const limit = query.limit || 10;
    const offset = query.offset || 0;

    let sql = `
        SELECT *
        FROM meal
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

// Get meals for a date
router.get("/date/", async (req, res) => {
    const query = req.query;

    let sqlMeals = `
        SELECT
            md.id,
            md.date,
            md.meal_fk,
            m.name,
            m.description,
            m.created_at,
            m.user_fk
        FROM meal_date AS md
        LEFT JOIN meal AS m ON md.meal_fk = m.id
        WHERE user_fk = ${req.user.id} AND date = '${query.date}'
    `;

    let sqlNutrition = `
        SELECT
            mc.calories * wg.percent AS calories,
            mc.calories AS main_calories,
            wg.percent AS goal_percent
        FROM maintenance_calories AS mc
        LEFT JOIN weight_goal AS wg ON mc.weight_goal_fk = wg.id
    `;

    let sqlNutritionLatest = `WHERE mc.date <= '${query.date}' AND mc.user_fk = ${req.user.id}`;
    let sqlNutritionClosest = `ORDER BY mc.date ASC LIMIT 1`;

    try {
        let meals = await req.conn.queryAsync(sqlMeals);

        for (let i = 0; i < meals.length; i++) {
            let mealTotal = await mealUtil.getMealTotals(req, meals[i].meal_fk);
            meals[i] = {
                ...meals[i],
                ...mealTotal,
            };
        }

        let dayTotals = await mealUtil.getDateTotals(meals);

        let nutritionDetails = await req.conn.queryAsync(sqlNutrition + sqlNutritionLatest);
        if (nutritionDetails.length === 0) {
            nutritionDetails = await req.conn.queryAsync(sqlNutrition + sqlNutritionClosest);
        }

        util.cleanup(req.conn);
        res.json({ nutritionDetails: nutritionDetails[0], meals, dayTotals });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// TODO: Get for all maintenance calories

//----------
//
//   POST
//
//----------

// Create a meal
router.post("/", async (req, res) => {
    const body = req.body;

    let sql = `
        INSERT
        INTO meal (
            name,
            description,
            user_fk)
        VALUES (?, ?, ?)
    `;

    try {
        validateMealInputs(body, true);

        let okPacket = await req.conn.queryAsync(sql, [body.name, body.description, req.user.id]);

        util.cleanup(req.conn);
        res.json({ success: "meal has been created", id: okPacket.insertId });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Add item to meal
router.post("/:id/item/:itemId/", async (req, res) => {
    const params = req.params;
    const body = req.body;

    let sql = `
        INSERT
        INTO meal_item (
            item_fk,
            item_percentage,
            meal_fk)
        VALUES (?, ?, ?)
    `;

    try {
        await verifyUser(req, params.id);

        let itemInMeal = await req.conn.queryAsync(`SELECT id FROM meal_item WHERE item_fk = ${params.itemId} AND meal_fk = ${params.id}`);
        if (itemInMeal.length > 0) throw Error("Item is already in meal, edit the serving percentage to change its quantity.");

        let itemPerc = validUtil.validateNum("Item Percentage", body.item_percentage, true, [0, 100]);
        if (itemPerc.valid === -1) throw Error(itemPerc.msg);

        let okPacket = await req.conn.queryAsync(sql, [params.itemId, body.item_percentage, params.id]);

        util.cleanup(req.conn);
        res.json({ success: "item has been added to meal" });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Add a meal to the day
router.post("/:id/date/", async (req, res) => {
    const body = req.body;
    const params = req.params;

    let sql = `
        INSERT
        INTO meal_date (
            date,
            meal_fk,
            user_fk)
        VALUES (?, ?, ?)
    `;

    try {
        await verifyUser(req, params.id);

        let date = dateUtil.getDateFromStr(body.date);
        let valDate = validUtil.validateDate("Meal Date", date, true, [
            dateUtil.getDateFromStr("1900-01-01"),
            dateUtil.getDateByTZ(new Date(), req.user.tz),
        ]);
        if (valDate.valid === -1) throw Error(valDate.msg);

        let okPacket = await req.conn.queryAsync(sql, [body.date, params.id, req.user.id]);

        util.cleanup(req.conn);
        res.json({ success: "meal has been added to date" });
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

// Update a meal
router.put("/:id/", async (req, res) => {
    const body = req.body;
    const params = req.params;

    try {
        await verifyUser(req, params.id);
        validateMealInputs(body, false);

        let updateStr = util.getUpdateStr(body, [], []);

        let sql = `
            UPDATE meal
            SET ${updateStr.valueStr}
            WHERE id = ${params.id}
        `;

        let okPacket = await req.conn.queryAsync(sql, updateStr.values);

        util.cleanup(req.conn);
        res.json({ success: "meal has been updated" });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Update item in meal
router.put("/:id/item/:itemId/", async (req, res) => {
    const params = req.params;
    const body = req.body;

    let sql = `
        UPDATE meal_item
        SET item_percentage = ?
        WHERE meal_fk = ${params.id} AND item_fk = ${params.itemId}
    `;

    try {
        await verifyUser(req, params.id);
        let itemPerc = validUtil.validateNum("Item Percentage", body.item_percentage, true, [0, 100]);
        if (itemPerc.valid === -1) throw Error(itemPerc.msg);

        let okPacket = await req.conn.queryAsync(sql, [body.item_percentage]);

        util.cleanup(req.conn);
        res.json({ success: "item has been modified" });
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

// Delete a meal
router.delete("/:id/", async (req, res) => {
    const params = req.params;

    let delete_sql = `
        DELETE FROM meal_date WHERE meal_fk = ${params.id};
        DELETE FROM meal_item WHERE meal_fk = ${params.id};
        DELETE FROM meal WHERE id = ${params.id}
    `;

    try {
        await verifyUser(req, params.id);

        let sqlArr = delete_sql.split(";");

        await util.runMultipleLinesOfSql(req, sqlArr, "Error with deleting meal.");

        util.cleanup(req.conn);
        res.json({ success: "Meal has been deleted." });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Delete item from a meal
router.delete("/:id/item/:itemId", async (req, res) => {
    const params = req.params;

    let delete_sql = `
        DELETE FROM meal_item WHERE meal_fk = ${params.id} AND item_fk = ${params.itemId}
    `;

    try {
        await verifyUser(req, params.id);

        let sqlArr = delete_sql.split(";");

        await util.runMultipleLinesOfSql(req, sqlArr, "Error deleting item from meal.");

        util.cleanup(req.conn);
        res.json({ success: "Item has been deleted from meal." });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Delete meal from date
router.delete("/:id/date/:dateId/", async (req, res) => {
    const params = req.params;

    let delete_sql = `
        DELETE FROM meal_date WHERE id = ${params.dateId}
    `;

    try {
        await verifyUser(req, params.id);

        let sqlArr = delete_sql.split(";");

        await util.runMultipleLinesOfSql(req, sqlArr, "Error deleting meal from date.");

        util.cleanup(req.conn);
        res.json({ success: "Meal has been deleted from date." });
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
    res.status(404).json({ error: "Requested meal endpoint does not exist." });
});

module.exports = router;
