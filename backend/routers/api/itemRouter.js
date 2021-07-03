const express = require('express');
const router = express.Router();
const serviceFunc = require('./serviceFunc');

const nameLenRange = [4, 20];
const caloriesRange = [0, 10000];
const macroRange = [0, 10000];
const costRange = [0, 10000];
const servSizeRange = [0, 10000];
const servSizeUnitRange = [7, 11];
const iconNumRange = [1, 1];
const categoryNumRange = [1, 12];

const handleError = (err) => {
    console.log(err);
    return err.message;
}

const validateItemInputs = (body, initial) => {
    serviceFunc.checkValidStr('Name', body.name, initial, nameLenRange, true, false);

    serviceFunc.checkValidInt('Calories', body.calories, initial, caloriesRange);
    serviceFunc.checkValidInt('Protein', body.protein, initial, macroRange);
    serviceFunc.checkValidInt('Carbs', body.carbs, initial, macroRange);
    serviceFunc.checkValidInt('Fat', body.fat, initial, macroRange);
    serviceFunc.checkValidInt('Cost', body.cost, initial, costRange);
    serviceFunc.checkValidInt('Serving Size', body.serving_size, initial, servSizeRange);
    serviceFunc.checkValidInt('Serving Size Unit Index', body.serving_size_unit_fk, initial, servSizeUnitRange);
    serviceFunc.checkValidInt('Icon Index', body.icon_fk, initial, iconNumRange);
    serviceFunc.checkValidInt('Category Index', body.category_fk, initial, categoryNumRange);
}


//---------
//
//   GET
//
//---------

// Get all user's items
router.get('/', async (req, res) => {
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

    try{
        let items = await req.conn.queryAsync(sql);

        res.send(items);
    }catch(err){
        const errors = handleError(err);
        res.status(400).send({ error: errors });
    }
});

// Get item by id
router.get('/single/:id/', async (req, res) => {
    const params = req.params;

    let sql = `
        SELECT *
        FROM item
        WHERE id = ${params.id}
    `;

    try{
        let item = await req.conn.queryAsync(sql);
        item = item[0];
        console.log(item);

        res.send(item);
    }catch(err){
        const errors = handleError(err);
        res.status(400).send({ error: errors });
    }
});

// Search for items with query param
router.get('/search/', async (req, res) => {
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

    try{
        let results = await req.conn.queryAsync(sql);

        res.send(results);
    }catch(err){
        const errors = handleError(err);
        res.status(400).send({ error: errors });
    }
});

// Search for items with query param and category
router.get('/search/category/:catId/', async (req, res) => {
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

    try{
        let results = await req.conn.queryAsync(sql);

        res.send(results);
    }catch(err){
        const errors = handleError(err);
        res.status(400).send({ error: errors });
    }
});

// Get items by category id with limits and offset params
router.get('/category/:catId/', async (req, res) => {
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

    try{
        let results = await req.conn.queryAsync(sql);

        res.send(results);
    }catch(err){
        const errors = handleError(err);
        res.status(400).send({ error: errors });
    }
});


//----------
//
//   POST
//
//----------

// Add an item to global list
router.post('/', async (req, res) => {
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

    try{
        validateItemInputs(body, true);

        let existingItem = await req.conn.queryAsync(`SELECT * FROM item WHERE name = '${body.name}'`);
        if(existingItem.length > 0){
            res.send({ alreadyExists: existingItem[0] });
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
            req.user.id
        ]);

        res.send({ success: 'item has been created', id: okPacket.insertId });
    }catch(err){
        const errors = handleError(err);
        res.status(400).send({ error: errors });
    }
});


//---------
//
//   PUT
//
//---------

// Update an item
router.put('/:id/', async (req, res) => {
    const body = req.body;
    const params = req.params;

    try{
        validateItemInputs(body, false);

        let updateStr = serviceFunc.getUpdateStr(body, ['serving_size', 'serving_size_unit_fk', 'category_fk']);
        if(updateStr.affected) throw Error('Cannot modify these attributes.');

        let sql = `
            UPDATE item
            SET ${updateStr.valueStr}
            WHERE id = ${params.id}
        `;

        let okPacket = await req.conn.queryAsync(sql, updateStr.values);

        res.send({ success: 'item has been updated' });
    }catch(err){
        const errors = handleError(err);
        res.status(400).send({ error: errors });
    }
});


//------------
//
//   DELETE
//
//------------

router.delete('/:id/', async (req, res) => {
    const params = req.params;

    let delete_sql = `
        DELETE FROM meal_item WHERE item_fk = ${params.id};
        DELETE FROM item WHERE id = ${params.id}
    `;

    try{
        let sqlArr = delete_sql.split(';');

        await serviceFunc.runMultipleLinesOfSql(req, sqlArr, 'Error with deleting item.');

        res.send({ success: 'Item has been deleted.' });
    }catch(err){
        const errors = handleError(err);
        res.status(400).send({ error: errors });
    }
});


//---------
//
//   404
//
//---------

router.use((req, res) => {
    res.send({ error: 'Requested item endpoint does not exist.' });
});

module.exports = router;