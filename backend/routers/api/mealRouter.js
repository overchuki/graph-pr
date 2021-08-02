const express = require("express");
const router = express.Router();
const serviceFunc = require("./serviceFunc");

const nameLenRange = [4, 20];
const descLenRange = [1, 100];

const validateMealInputs = (body, initial) => {
    serviceFunc.checkValidStr("Name", body.name, initial, nameLenRange, true, false);
    serviceFunc.checkValidStr("Description", body.description, false, descLenRange, true, false);
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

        res.send(meals);
    } catch (err) {
        const errors = serviceFunc.handleError(err);
        res.send({ error: errors });
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

        let mealItems = await serviceFunc.getMealItems(req, meal.id);

        let mealTotals = await serviceFunc.getMealTotals(req, meal.id);

        res.send({ meal, mealTotals, mealItems });
    } catch (err) {
        const errors = serviceFunc.handleError(err);
        res.send({ error: errors });
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

        res.send(results);
    } catch (err) {
        const errors = serviceFunc.handleError(err);
        res.send({ error: errors });
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
        WHERE date = '${query.date}'
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
            let mealTotal = await serviceFunc.getMealTotals(req, meals[i].meal_fk);
            meals[i] = {
                ...meals[i],
                ...mealTotal,
            };
        }

        let dayTotals = await serviceFunc.getDateTotals(meals);

        let nutritionDetails = await req.conn.queryAsync(sqlNutrition + sqlNutritionLatest);
        if (nutritionDetails.length === 0) {
            nutritionDetails = await req.conn.queryAsync(sqlNutrition + sqlNutritionClosest);
        }

        res.send({ nutritionDetails: nutritionDetails[0], meals, dayTotals });
    } catch (err) {
        const errors = serviceFunc.handleError(err);
        res.send({ error: errors });
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

        res.send({ success: "meal has been created", id: okPacket.insertId });
    } catch (err) {
        const errors = serviceFunc.handleError(err);
        res.send({ error: errors });
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

        serviceFunc.checkValidInt("Item Percentage", body.item_percentage, true, [0, 100]);

        let okPacket = await req.conn.queryAsync(sql, [params.itemId, body.item_percentage, params.id]);

        res.send({ success: "item has been added to meal" });
    } catch (err) {
        const errors = serviceFunc.handleError(err);
        res.send({ error: errors });
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
            meal_fk)
        VALUES (?, ?)
    `;

    try {
        await verifyUser(req, params.id);

        let date = serviceFunc.getDateFromStr(body.date);
        serviceFunc.checkValidInt("Meal Date", date, true, [
            serviceFunc.getDateFromStr("1900-01-01"),
            serviceFunc.getDateByTZ(new Date(), req.user.tz),
        ]);

        let okPacket = await req.conn.queryAsync(sql, [body.date, params.id]);

        res.send({ success: "meal has been added to date" });
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

// Update a meal
router.put("/:id/", async (req, res) => {
    const body = req.body;
    const params = req.params;

    try {
        await verifyUser(req, params.id);
        validateMealInputs(body, false);

        let updateStr = serviceFunc.getUpdateStr(body, []);

        let sql = `
            UPDATE meal
            SET ${updateStr.valueStr}
            WHERE id = ${params.id}
        `;

        let okPacket = await req.conn.queryAsync(sql, updateStr.values);

        res.send({ success: "meal has been updated" });
    } catch (err) {
        const errors = serviceFunc.handleError(err);
        res.send({ error: errors });
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
        serviceFunc.checkValidInt("Item Percentage", body.item_percentage, true, [0, 100]);

        let okPacket = await req.conn.queryAsync(sql, [body.item_percentage]);

        res.send({ success: "item has been modified" });
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

        await serviceFunc.runMultipleLinesOfSql(req, sqlArr, "Error with deleting meal.");

        res.send({ success: "Meal has been deleted." });
    } catch (err) {
        const errors = serviceFunc.handleError(err);
        res.send({ error: errors });
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

        await serviceFunc.runMultipleLinesOfSql(req, sqlArr, "Error deleting item from meal.");

        res.send({ success: "Item has been deleted from meal." });
    } catch (err) {
        const errors = serviceFunc.handleError(err);
        res.send({ error: errors });
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

        await serviceFunc.runMultipleLinesOfSql(req, sqlArr, "Error deleting meal from date.");

        res.send({ success: "Meal has been deleted from date." });
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
    res.status(404).send({ error: "Requested meal endpoint does not exist." });
});

module.exports = router;
