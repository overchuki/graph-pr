const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { requireAuth } = require('./authMiddleware');
const router = express.Router();

const saltRounds = 10;
const maxTokenAgeSeconds = 1 * 24 * 60 * 60;
const millisInYear = 1000 * 60 * 60 * 24 * 365;
const lbToKgFactor = 0.45359237;
const kgToLbFactor = 2.20462262;
const inToCmFactor = 2.54;
const cmToInFactor = 0.393700787;

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

const handleError = (err) => {
    console.log(err);
    return err.message;
}

const createJWTToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: maxTokenAgeSeconds });
}

const getDateStr = (date) => {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}

const checkValidStr = (key, value, required, range, isAscii, isEmail) => {
    if(!value){
        if(required) throw Error('Please fill out all required fields.');
        else return;
    }
    if(value.length < range[0]) throw Error(key + ' is too short.');
    if(value.length > range[1]) throw Error(key + ' is too long.');
    if(isAscii && !validator.isAscii(value)) throw Error('Please use valid characters only (ASCII).');
    if(isEmail && !validator.isEmail(value)) throw Error('Invalid email address.');
}

const checkValidInt = (key, value, required, range) => {
    if(!value){
        if(required) throw Error('Please fill out all required fields.');
        else return;
    }
    if(value > range[1]) throw Error(key + ' is too large.');
    if(value < range[0]) throw Error(key + ' is too small.');
}

const validateUserInfo = (body, initial) => {
    checkValidStr('Name', body.name, initial, nameLenRange, true, false);
    checkValidStr('Username', body.username, initial, usernameLenRange, true, false);
    checkValidStr('Email', body.email, false, emailLenRange, false, true);
    checkValidStr('Description', body.description, false, descriptionLenRange, true, false);
    checkValidStr('Password', body.password, initial, passwordLenRange, true, false);

    checkValidInt('Height unit index', body.height_unit_fk, initial, heightUnitNumRange);
    checkValidInt('Gender index', body.gender_fk, initial, genderNumRange);
    checkValidInt('Activity index', body.activity_level_fk, initial, activityLevelNumRange);
    checkValidInt('Icon index', body.icon_fk, initial, iconNumRange);
    checkValidInt('Bw unit index', body.bw_unit, initial, bwUnitNumRange);

    let curDate = new Date();
    let dob = new Date(body.dob);
    let dateMax = curDate.setFullYear(curDate.getFullYear() - ageNumRange[0]);
    let dateMin = curDate.setFullYear(curDate.getFullYear() - ageNumRange[1] + ageNumRange[0]);
    checkValidInt('Date of Birth', dob, initial, [dateMin, dateMax]);
}

const getBMR = async (req, bodyweight, height, age, gender) => {
    let bmr = (10 * bodyweight) + (6.25 * height) - (5 * age);

    let genderNum = await req.conn.queryAsync(`SELECT bmr_num FROM gender WHERE id = ${gender}`);
    if(genderNum.length === 0) throw Error('Invalid gender index.');

    bmr += genderNum[0].bmr_num;

    return Math.round(bmr);
}

const getMaintenanceCal = async (req, bmr, activity_level) => {
    let sql = `
        SELECT bmr_multiplier
        FROM activity_level
        WHERE id = ${activity_level}
    `;

    let multiplier = await req.conn.queryAsync(sql);
    if(multiplier.length === 0) throw Error('Invalid activity level index.');
    
    return Math.round(bmr * multiplier[0].bmr_multiplier);
}

const updateMaintenanceCal = async (req, userId) => {
    let userArr = await req.conn.queryAsync(`SELECT * FROM user WHERE id = ${userId}`);
    let user = userArr[0];

    let dob = new Date(user.dob);
    let curDate = new Date();
    let dateStr = getDateStr(curDate);
    let age = (curDate - dob) / millisInYear;

    let sql = `
        SELECT weight, unit_fk
        FROM bodyweight
        WHERE user_fk = ${user.id}
        ORDER BY date DESC
        LIMIT 1
    `;

    let latestBodyweight = await req.conn.queryAsync(sql);
    if(latestBodyweight.length === 0) throw Error('User does not have recorded bodyweight');

    let deletePacket = await req.conn.queryAsync(`DELETE FROM maintenance_calories WHERE user_fk = ${user.id} AND date = '${dateStr}'`);

    let kgBodyweight;
    if(latestBodyweight[0].unit_fk === 2) kgBodyweight = latestBodyweight[0].weight * lbToKgFactor;
    else kgBodyweight = latestBodyweight[0].weight;

    let cmHeight;
    if(user.height_unit_fk === 6) cmHeight = user.height * inToCmFactor;
    else cmHeight = user.height;

    let bmr = await getBMR(req, kgBodyweight, cmHeight, age, user.gender_fk);
    let main_cal = await getMaintenanceCal(req, bmr, user.activity_level_fk);

    let sql2 = `
        INSERT
        INTO maintenance_calories (
            bmr,
            calories,
            date,
            activity_level_fk,
            user_fk)
        VALUES (?, ?, ?, ?, ?)
    `;
    let okPacket = await req.conn.queryAsync(sql2, [bmr, main_cal, curDate, user.activity_level_fk, user.id]);
    return okPacket;
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
        const errors = handleError(err);
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
                const token = createJWTToken(user[0].id);
                res.cookie('jwt', token, { httpOnly: true, maxAge: maxTokenAgeSeconds * 1000 });
                res.send({ success: 'Login successful.' });
            }else{
                throw Error('Wrong password.');
            }
        }else{
            throw Error('Wrong email or username.');
        }
    }catch(err){
        const errors = handleError(err);
        res.status(400).send({ error: errors });
    }
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
            gender_fk,
            activity_level_fk,
            password,
            icon_fk)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try{
        validateUserInfo(body, true);

        let hashedPW = await new Promise((resolve, reject) => {
            bcrypt.hash(body.password, saltRounds, async (err, hash) => {
                if(err) reject(err);
                else resolve(hash);
            });
        });

        let dob = new Date(body.dob);
        let curDate = new Date();

        let okPacket = await req.conn.queryAsync(sql, [ body.name,
                                                        body.username,
                                                        body.email,
                                                        body.description,
                                                        dob,
                                                        body.height,
                                                        body.height_unit_fk,
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
                unit_fk,
                user_fk)
            VALUES (?, ?, ?, ?)
        `;
        let okPacket2 = await req.conn.queryAsync(sql2, [body.bodyweight, curDate, body.bw_unit, okPacket.insertId]);
        
        let okPacket3 = await updateMaintenanceCal(req, okPacket.insertId);

        res.send({ success: 'User has been created.' });
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

// Modify a user's account
router.put('/account/', requireAuth, async (req, res) => {
    const body = req.body;

    try{
        validateUserInfo(body, false);

        let maintenanceAffected = false;
        let maintenanceFactors = ['dob', 'height', 'height_unit_fk', 'gender_fk', 'activity_level_fk'];

        let valueStr = '';
        let values = [];
        let keys = Object.keys(body);
        
        if(keys.length === 0) throw Error('Please modify something.');
        
        for(let i = 0;i < keys.length; i++){
            if(!body[keys[i]]) continue;
            
            if(maintenanceFactors.includes(keys[i])) maintenanceAffected = true;
            
            valueStr += `${keys[i]} = ?,`;
            values.push(body[keys[i]]);
        }

        valueStr = valueStr.substring(0, valueStr.length-1);

        let sql = `
            UPDATE user
            SET ${valueStr}
            WHERE id = ${req.user.id}
        `;

        let okPacket = await req.conn.queryAsync(sql, values);

        let okPacket2 = await updateMaintenanceCal(req, req.user.id);

        res.send({ success: "Account has been modified." });
    }catch(err){
        const errors = handleError(err);
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
        const errors = handleError(err);
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

    
    //delete maintenance_calories, exercise, exercise_set, lift, lift_set, bodyweight
    //modify but dont delete item, meal

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
                DELETE FROM exercise_set WHERE ${exerciseStr};
                DELETE FROM lift_set WHERE ${liftStr};
                DELETE FROM exercise WHERE user_fk = ${id};
                DELETE FROM lift WHERE user_fk = ${id};
                DELETE FROM maintenance_calories WHERE user_fk = ${id};
                DELETE FROM bodyweight WHERE user_fk = ${id};
                DELETE FROM user WHERE id = ${id};
            `;

            let sqlArr = delete_sql.split(';');

            for(let sql of sqlArr){
                if(sql.length === 0) continue;
                try{
                    await req.conn.queryAsync(sql);
                }catch(err){
                    console.log('Error with deleting account: ', err);
                    break;
                }
            }
            
            res.send({ success: 'Account has been deleted.' });
        }else{
            throw Error('Password is wrong.')
        }
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
    res.status(404).send({ error: 'Requested auth endpoint does not exist.' });
});

module.exports = router;