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

const nameLenRange = [2, 20];
const usernameLenRange = [4, 20];
const emailLenRange = [1, 256];
const descriptionLenRange = [1, 100];
const passwordLenRange = [8, 256];

const iconNumRange = [1, 1];
const heightNumRange = [20, 300];
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

    checkValidInt('Height', body.height, initial, heightNumRange);
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
            gender_fk,
            bmr,
            activity_level_fk,
            main_cal,
            password,
            icon_fk)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        let age = (curDate - dob) / millisInYear;
        
        let kgBodyweight;
        if(body.bw_unit === 2) kgBodyweight = body.bodyweight * lbToKgFactor;
        else kgBodyweight = body.bodyweight;

        let bmr = await getBMR(req, kgBodyweight, body.height, age, body.gender_fk);
        let main_cal = await getMaintenanceCal(req, bmr, body.activity_level_fk);

        let okPacket = await req.conn.queryAsync(sql, [ body.name,
                                                        body.username,
                                                        body.email,
                                                        body.description,
                                                        dob,
                                                        body.height,
                                                        body.gender_fk,
                                                        bmr,
                                                        body.activity_level_fk,
                                                        main_cal,
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

        let valueStr = '';
        let values = [];
        let keys = Object.keys(body);
        for(let i = 0;i < keys.length; i++){
            if(!body[keys[i]]) continue;
            valueStr += `${keys[i]} = ?,`;
            values.push(body[keys[i]]);
        }
        valueStr = valueStr.substring(0, valueStr.length-1);

        let sql = `
            UPDATE user
            SET ${valueStr}
            WHERE id = ${req.user.id}
        `;
        console.log(sql)
        console.log(values)

        let okPacket = await req.conn.queryAsync(sql, values);

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

    let sql = `
        DELETE
        FROM user
        WHERE id = ?
    `;

    try{
        const auth = await bcrypt.compare(body.pass, req.user.password);

        if(auth){
            let okPacket = await req.conn.queryAsync(sql, [req.user.id]);
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