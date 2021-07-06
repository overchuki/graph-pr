const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { requireAuth } = require('../../auth/authMiddleware');
const serviceFunc = require('./serviceFunc');
const router = express.Router();

const saltRounds = 10;
const maxTokenAgeSeconds = 1 * 24 * 60 * 60;

const nameLenRange = [2, 20];
const usernameLenRange = [4, 20];
const emailLenRange = [1, 256];
const descriptionLenRange = [1, 100];
const passwordLenRange = [8, 256];

const iconNumRange = [1, 1];
const heightUnitNumRange = [5, 6];
const genderNumRange = [1, 2];
const activityLevelNumRange = [1, 5];
const ageNumRange = [13, 150];
const bwUnitNumRange = [1, 2];

const createJWTToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: maxTokenAgeSeconds });
}

const validateUserInfo = (body, initial, tz) => {
    serviceFunc.checkValidStr('Name', body.name, initial, nameLenRange, true, false);
    serviceFunc.checkValidStr('Username', body.username, initial, usernameLenRange, true, false);
    serviceFunc.checkValidStr('Email', body.email, false, emailLenRange, false, true);
    serviceFunc.checkValidStr('Description', body.description, false, descriptionLenRange, true, false);
    serviceFunc.checkValidStr('Password', body.password, initial, passwordLenRange, true, false);
    serviceFunc.checkValidStr('Timezone', body.tz, initial, [1, 100], true, false);

    serviceFunc.checkValidInt('Height unit index', body.height_unit_fk, initial, heightUnitNumRange);
    serviceFunc.checkValidInt('Gender index', body.gender_fk, initial, genderNumRange);
    serviceFunc.checkValidInt('Activity index', body.activity_level_fk, initial, activityLevelNumRange);
    serviceFunc.checkValidInt('Icon index', body.icon_fk, initial, iconNumRange);
    serviceFunc.checkValidInt('Bw unit index', body.bw_unit_fk, initial, bwUnitNumRange);

    let curDate = serviceFunc.getDateByTZ(new Date(), tz);
    let dob = serviceFunc.getDateFromStr(body.dob);
    let dateMax = curDate.setFullYear(curDate.getFullYear() - ageNumRange[0]);
    let dateMin = curDate.setFullYear(curDate.getFullYear() - ageNumRange[1] + ageNumRange[0]);
    serviceFunc.checkValidInt('Date of Birth', dob, initial, [dateMin, dateMax]);
}


//---------
//
//   GET
//
//---------

// Check if username/email is already taken
router.get('/exists/', async (req, res) => {
    const query = req.query;

    let validTypes = ['email', 'username'];

    const sql = `
        SELECT *
        FROM user
        WHERE ${query.type} = ?
    `;

    try{
        if(validTypes.indexOf(query.type) === -1) throw Error('Invalid type.');
        
        const user = await req.conn.queryAsync(sql, [query.str]);
        
        if(user.length > 0){
            res.send({ available: false });
        }else{
            res.send({ available: true });
        }
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

// Log a user in
router.post('/login/', async (req, res) => {
    const body = req.body;

    const sql = `
        SELECT *
        FROM user
        WHERE username = ? OR email = ?
    `;

    try{
        const user = await req.conn.queryAsync(sql, [body.user, body.user]);
        
        if(user.length > 0){
            const auth = await bcrypt.compare(body.pass, user[0].password);
            
            if(auth){
                const token = createJWTToken({ id: user[0].id, tz: body.tz });
                res.cookie('jwt', token, { httpOnly: true, maxAge: maxTokenAgeSeconds * 1000 });
                res.send({ success: 'Login successful.' });
            }else{
                throw Error('Wrong password.');
            }
        }else{
            throw Error('Wrong email or username.');
        }
    }catch(err){
        const errors = serviceFunc.handleError(err);
        res.status(400).send({ error: errors });
    }
});

// Log a user out
router.post('/logout/', requireAuth, async (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.send({ success: 'User has been logged out.' });
});

// Sign a user up
router.post('/signup/', async (req, res) => {
    const body = req.body;

    const sql = `
        INSERT
        INTO user (
            name,
            username,
            email,
            description,
            dob,
            height,
            height_unit_fk,
            bw_unit_fk,
            gender_fk,
            activity_level_fk,
            password,
            icon_fk)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try{
        validateUserInfo(body, true, body.tz);

        let hashedPW = await new Promise((resolve, reject) => {
            bcrypt.hash(body.password, saltRounds, async (err, hash) => {
                if(err) reject(err);
                else resolve(hash);
            });
        });

        let dob = serviceFunc.getDateFromStr(body.dob);
        let curDate = serviceFunc.getDateByTZ(new Date(), body.tz);

        let okPacket = await req.conn.queryAsync(sql, [ body.name,
                                                        body.username,
                                                        body.email,
                                                        body.description,
                                                        dob,
                                                        body.height,
                                                        body.height_unit_fk,
                                                        body.bw_unit_fk,
                                                        body.gender_fk,
                                                        body.activity_level_fk,
                                                        hashedPW,
                                                        body.icon_fk
                                                    ]
        );
        
        let sql2 = `
            INSERT
            INTO bodyweight (
                weight,
                date,
                user_fk)
            VALUES (?, ?, ?)
        `;
        let okPacket2 = await req.conn.queryAsync(sql2, [body.bodyweight, curDate, okPacket.insertId]);
        
        let okPacket3 = await serviceFunc.updateMaintenanceCal(req, okPacket.insertId, serviceFunc.getDateStr(curDate, ''), body.tz);

        res.send({ success: 'User has been created.' });
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

// Modify a user's account
router.put('/account/', requireAuth, async (req, res) => {
    const body = req.body;

    try{
        validateUserInfo(body, false, req.user.tz);

        let maintenanceFactors = ['dob', 'height', 'height_unit_fk', 'gender_fk', 'bw_unit_fk', 'activity_level_fk'];
        let updateStr = serviceFunc.getUpdateStr(body, maintenanceFactors);

        let sql = `
            UPDATE user
            SET ${updateStr.valueStr}
            WHERE id = ${req.user.id}
        `;

        let okPacket = await req.conn.queryAsync(sql, updateStr.values);

        let curDate = serviceFunc.getDateByTZ(new Date(), req.user.tz);

        if(updateStr.affected){
            let okPacket2 = await serviceFunc.updateMaintenanceCal(req, req.user.id, serviceFunc.getDateStr(curDate, ''), req.user.tz);
        }

        res.send({ success: "Account has been modified." });
    }catch(err){
        const errors = serviceFunc.handleError(err);
        res.status(400).send({ error: errors });
    }
});

// Change a user's password
router.put('/password/', requireAuth, async (req, res) => {
    const body = req.body;

    let sql = `
        UPDATE user
        SET password = ?
        WHERE id = ${req.user.id}
    `;

    try{
        const auth = await bcrypt.compare(body.oldPass, req.user.password);

        if(auth){
            const sameAsOld = await bcrypt.compare(body.newPass, req.user.password);
            if(sameAsOld) throw Error('New password is the same as the old one.');

            let hashedPW = await new Promise((resolve, reject) => {
                bcrypt.hash(body.newPass, saltRounds, async (err, hash) => {
                    if(err) reject(err);
                    else resolve(hash);
                });
            });

            let okPacket = await req.conn.queryAsync(sql, [hashedPW]);
            res.send({ success: 'Password has been updated.' });
        }else{
            throw Error('Old password is wrong.')
        }
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

// Delete a user's account
router.delete('/', requireAuth, async (req, res) => {
    const body = req.body;

    try{
        const auth = await bcrypt.compare(body.pass, req.user.password);

        if(auth){
            let id = req.user.id;

            let exercises = await req.conn.queryAsync(`SELECT id FROM exercise WHERE user_fk = ${id}`);
            let exerciseStr = '';
            let lifts = await req.conn.queryAsync(`SELECT id FROM lift WHERE user_fk = ${id}`);
            let liftStr = '';

            for(let exexerciseId of exercises) exerciseStr += `exercise_fk = ${exexerciseId} OR `;
            for(let liftId of lifts) liftStr += `lift_fk = ${liftId} OR `;

            exerciseStr = exerciseStr.substring(0, exerciseStr.length - 3);
            liftStr = liftStr.substring(0, liftStr.length - 3);

            let delete_sql = `
                UPDATE item SET user_fk = 1 WHERE user_fk = ${id};
                UPDATE meal SET user_fk = 1 WHERE user_fk = ${id};
            `;

            if(exerciseStr.length > 0) delete_sql += `DELETE FROM exercise_set WHERE ${exerciseStr};`;
            
            if(liftStr.length > 0) delete_sql += `DELETE FROM lift_set WHERE ${liftStr};`;
            
            delete_sql += `
                DELETE FROM exercise WHERE user_fk = ${id};
                DELETE FROM lift WHERE user_fk = ${id};
                DELETE FROM maintenance_calories WHERE user_fk = ${id};
                DELETE FROM bodyweight WHERE user_fk = ${id};
                DELETE FROM user WHERE id = ${id}
            `;

            let sqlArr = delete_sql.split(';');

            await serviceFunc.runMultipleLinesOfSql(req, sqlArr, 'Error with deleting account.');
            
            res.send({ success: 'Account has been deleted.' });
        }else{
            throw Error('Password is wrong.')
        }
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
    res.status(404).send({ error: 'Requested auth endpoint does not exist.' });
});

module.exports = router;