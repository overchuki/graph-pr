const getMealTotals = async (req, mealId) => {
    let sql = `
        SELECT
            SUM(item.calories * meal_item.item_percentage) AS calories,
            SUM(item.protein * meal_item.item_percentage) AS protein,
            SUM(item.carbs * meal_item.item_percentage) AS carbs,
            SUM(item.fat * meal_item.item_percentage) AS fat,
            SUM(item.cost * meal_item.item_percentage) AS cost
        FROM meal_item
        LEFT JOIN item ON meal_item.item_fk = item.id
        WHERE meal_item.meal_fk = ${mealId}
    `;

    let totals = await req.conn.queryAsync(sql);

    return totals[0];
};

const getMealItems = async (req, mealId) => {
    let sql = `
        SELECT
            mi.item_percentage AS percent,
            i.name,
            i.calories * mi.item_percentage AS calories,
            i.protein * mi.item_percentage AS protein,
            i.carbs * mi.item_percentage AS carbs,
            i.fat * mi.item_percentage AS fat,
            i.cost * mi.item_percentage AS cost,
            i.serving_size * mi.item_percentage AS serving_size,
            (IF(i.serving_size * mi.item_percentage = 1, u.sing_abbr, u.plur_abbr)) AS unit,
            icon.location,
            ic.name AS category
        FROM meal_item AS mi
        LEFT JOIN item AS i ON mi.item_fk = i.id
        LEFT JOIN unit AS u ON i.serving_size_unit_fk = u.id
        LEFT JOIN item_category AS ic ON i.category_fk = ic.id
        LEFT JOIN icon ON i.icon_fk = icon.id
        WHERE mi.meal_fk = ${mealId}
    `;

    let items = await req.conn.queryAsync(sql);

    return items;
};

const getDateTotals = (mealTotals) => {
    let totals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        cost: 0,
    };

    for (let meal of mealTotals) {
        for (let key of Object.keys(totals)) {
            totals[key] += parseInt(meal[key]);
        }
    }

    return totals;
};

module.exports = {
    getMealTotals,
    getMealItems,
    getDateTotals,
};
