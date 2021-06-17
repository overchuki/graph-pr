const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { requireAuth } = require('./authMiddleware');
const router = express.Router();

const saltRounds = 10;
const maxTokenAgeSeconds = 1 * 24 * 60 * 60;
const maxNumOfIcons = 1;

const handleError = (err) => {
    console.log(err);
    return err.message;
}

const createJWTToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: maxTokenAgeSeconds });
}

const checkValidStr = (key, value, required, minLen, maxLen, isAscii, isEmail) => {
    if(!value){
        if(required) throw Error('Please fill out all required fields.');
        else return;
    }
    if(value.length < minLen) throw Error(key + ' is too short.');
    if(value.length > maxLen) throw Error(key + ' is too long.');
    if(isAscii && !validator.isAscii(value)) throw Error('Please use valid characters only (ASCII).');
    if(isEmail && !validator.isEmail(value)) throw Error('Invalid email address.');
}

const validateUserInfo = (body, initial) => {
    checkValidStr('Name', body.name, (true && initial), 2, 20, true, false);
    checkValidStr('Username', body.username, (true && initial), 4, 20, true, false);
    checkValidStr('Email', body.email, false, 0, 256, false, true);
    checkValidStr('Description', body.description, false, 1, 100, true, false);
    checkValidStr('Password', body.password, (true && initial), 8, 256, true, false);

    if(body.icon_fk && body.icon_fk > maxNumOfIcons) throw Error('Icon index out of bounds.');
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
            password,
            icon_fk)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    try{
        validateUserInfo(body, true);

        let hashedPW = await new Promise((resolve, reject) => {
            bcrypt.hash(body.password, saltRounds, async (err, hash) => {
                if(err) reject(err);
                else resolve(hash);
            });
        });

        let okPacket = await req.conn.queryAsync(sql, [body.name, body.username, body.email, body.description, hashedPW, body.icon_fk]);
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