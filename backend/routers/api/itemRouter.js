const express = require('express');
const router = express.Router();

//---------
//
//   GET
//
//---------

// Get all user's items
router.get('/', async (req, res) => {

    let sql = `
        SELECT *
        FROM item
        WHERE user_fk = ${req.user.id}
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
router.get('/:id/', async (req, res) => {
    const params = req.params;

    let sql = `

    `;

    try{
        res.send('get item by id endpoint');
    }catch(err){
        const errors = handleError(err);
        res.status(400).send({ error: errors });
    }
});

// Search for items with query param
router.get('/search/', async (req, res) => {
    const params = req.params;

    let sql = `

    `;

    try{
        res.send('get items by search endpoint');
    }catch(err){
        const errors = handleError(err);
        res.status(400).send({ error: errors });
    }
});

// Get items by category id with limits and offset params
router.get('/category/:id/', async (req, res) => {
    const params = req.params;

    let sql = `

    `;

    try{
        res.send('get items by category endpoint');
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

    `;

    try{
        res.send('post item endpoint');
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

// Modify an item if it is the user's item
router.put('/:id/', async (req, res) => {
    const params = req.params;
    const body = req.body;

    let sql = `

    `;

    try{
        res.send('put item endpoint');
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
    const body = req.body;

    let sql = `

    `;

    try{
        res.send('delete account endpoint');
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