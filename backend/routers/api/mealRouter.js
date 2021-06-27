const express = require('express');
const router = express.Router();
const serviceFunc = require('./serviceFunc');

const nameLenRange = [4, 20];
const descLenRange = [1, 100];

const handleError = (err) => {
    console.log(err);
    return err.message;
}

const validateMealInputs = (body, initial) => {
    serviceFunc.checkValidStr('Name', body.name, initial, nameLenRange, true, false);
    serviceFunc.checkValidStr('Description', body.description, false, descLenRange, true, false);
}


//---------
//
//   GET
//
//---------

// Get all user's meals
router.get('/', async (req, res) => {
    const limit = query.limit || 10;
    const offset = query.offset || 0;

    let sql = `
        SELECT *
        FROM meal
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

// Get meal by id
//TODO: get and return array of every item, plust total macros
router.get('/single/:id/', async (req, res) => {
    const params = req.params;

    let sql = `
        SELECT *
        FROM meal
        WHERE id = ${params.id}
    `;

    try{
        let meal = await req.conn.queryAsync(sql);
        meal = meal[0];

        res.send(meal);
    }catch(err){
        const errors = handleError(err);
        res.status(400).send({ error: errors });
    }
});

// Search for meals with query param
router.get('/search/', async (req, res) => {
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

// Create a meal
router.post('/', async (req, res) => {
    const body = req.body;

    let sql = `
        INSERT
        INTO meal (
            name,
            description,
            user_fk)
        VALUES (?, ?, ?)
    `;

    try{
        validateMealInputs(body, true);

        let okPacket = await req.conn.queryAsync(sql, [
            body.name,
            body.description,
            req.user.id
        ]);

        res.send({ success: 'meal has been created', id: okPacket.insertId });
    }catch(err){
        const errors = handleError(err);
        res.status(400).send({ error: errors });
    }
});

// Update a meal
router.post('/:id/item/:itemId/', async (req, res) => {
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

    try{
        serviceFunc.checkValidInt('Item Percentage', body.item_percentage, true, [0, 1]);

        let okPacket = await req.conn.queryAsync(sql, [params.itemId, body.item_percentage, params.id]);

        res.send({ success: 'item has been added to meal' });
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

// Update a meal
router.put('/:id/', async (req, res) => {
    const body = req.body;
    const params = req.params;

    try{
        validateMealInputs(body, false);

        let updateStr = serviceFunc.getUpdateStr(body, []);

        let sql = `
            UPDATE meal
            SET ${updateStr.valueStr}
            WHERE id = ${params.id}
        `;

        let okPacket = await req.conn.queryAsync(sql, updateStr.values);

        res.send({ success: 'meal has been updated' });
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





//---------
//
//   404
//
//---------

router.use((req, res) => {
    res.send({ error: 'Requested meal endpoint does not exist.' });
});

module.exports = router;