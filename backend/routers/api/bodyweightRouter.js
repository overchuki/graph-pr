const express = require('express');
const router = express.Router();
const serviceFunc = require('./serviceFunc');

const weightIntRange = [1, 1000];

const validateBWInputs = (body, initial, tz) => {
    serviceFunc.checkValidInt('Weight', body.weight, initial, weightIntRange);
    serviceFunc.checkValidInt('Date', serviceFunc.getDateFromStr(body.date), initial, [serviceFunc.getDateFromStr('18500101'), serviceFunc.getDateByTZ(new Date(), tz)]);
}

const verifyUser = async (req, id) => {
    let sql = `SELECT * FROM bodyweight WHERE id = ${id}`;

    let bw = await req.conn.queryAsync(sql);
    if(bw[0].user_fk != req.user.id) throw Error('You can only modify your own bodyweight.');
}


//---------
//
//   GET
//
//---------

// Get user's bodyweight with query params
router.get('/', async (req, res) => {
    const query = req.query;
    const limit = query.limit || null;
    const offset = query.offset || null;
    const order = query.order || true;

    let orderStr = 'DESC';
    if(order === 'false') orderStr = 'ASC';

    let sql = `
        SELECT *
        FROM bodyweight
        WHERE user_fk = ${req.user.id}
        ORDER BY date ${orderStr}
    `;
    if(limit && offset){
        sql += `
            LIMIT ${limit}
            OFFSET ${offset}
        `;
    }

    try{
        let bw = await req.conn.queryAsync(sql);

        res.send(bw);
    }catch(err){
        const errors = serviceFunc.handleError(err);
        res.status(400).send({ error: errors });
    }
});

// Get user's last bodyweight
router.get('/last/', async (req, res) => {

    try{
        let bw = await serviceFunc.getLastBodyweight(req, req.user.id, serviceFunc.getDateStrByTZ(new Date(), '', req.user.tz));

        res.send(bw);
    }catch(err){
        const errors = serviceFunc.handleError(err);
        res.status(400).send({ error: errors });
    }
});


//----------
//
//   POST
//
//----------

// Create a bodyweight entry
router.post('/', async (req, res) => {
    const body = req.body;

    let sql = `
        INSERT
        INTO bodyweight (
            weight,
            date,
            user_fk)
        VALUES (?, ?, ?)
    `;

    try{
        validateBWInputs(body, true, req.user.tz);

        let okPacket = await req.conn.queryAsync(sql, [body.weight, body.date, req.user.id]);

        let okPacket2 = await serviceFunc.updateMaintenanceCal(req, req.user.id, body.date, req.user.tz);

        res.send({ success: 'BW entry has been added', id: okPacket.insertId });
    }catch(err){
        const errors = serviceFunc.handleError(err);
        res.status(400).send({ error: errors });
    }
});


//---------
//
//   PUT
//
//---------

// Update a bw entry
router.put('/:id/', async (req, res) => {
    const body = req.body;
    const params = req.params;

    try{
        await verifyUser(req, params.id);
        validateBWInputs(body, false, req.user.tz);

        let updateStr = serviceFunc.getUpdateStr(body, []);

        let sql = `
            UPDATE bodyweight
            SET ${updateStr.valueStr}
            WHERE id = ${params.id}
        `;

        let okPacket = await req.conn.queryAsync(sql, updateStr.values);
        
        let updatedBW = await req.conn.queryAsync(`SELECT date FROM bodyweight WHERE id = ${params.id}`);

        let okPacket2 = await serviceFunc.updateMaintenanceCal(req, req.user.id, serviceFunc.getDateStr(updatedBW[0].date, ''), req.user.tz);

        res.send({ success: 'BW entry has been updated' });
    }catch(err){
        const errors = serviceFunc.handleError(err);
        res.status(400).send({ error: errors });
    }
});


//------------
//
//   DELETE
//
//------------

// Delete a bw entry
router.delete('/:id/', async (req, res) => {
    const params = req.params;

    let sql = `
        SELECT *
        FROM bodyweight
        WHERE id = ${params.id}
    `;

    try{
        await verifyUser(req, params.id);
        
        let bw = await req.conn.queryAsync(sql);
        
        let delete_sql = `
            DELETE FROM maintenance_calories WHERE user_fk = ${req.user.id} AND date = '${serviceFunc.getDateStr(bw[0].date, '')}';
            DELETE FROM bodyweight WHERE id = ${params.id}
        `;

        let sqlArr = delete_sql.split(';');

        await serviceFunc.runMultipleLinesOfSql(req, sqlArr, 'Error with deleting bw entry.');

        res.send({ success: 'BW entry has been deleted.' });
    }catch(err){
        const errors = serviceFunc.handleError(err);
        res.status(400).send({ error: errors });
    }
});


//---------
//
//   404
//
//---------

router.use((req, res) => {
    res.send({ error: 'Requested bodyweight endpoint does not exist.' });
});

module.exports = router;