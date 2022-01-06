const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { requireAuth } = require("../../auth/authMiddleware");
const util = require("./utils/util");
const bwUtil = require("./utils/bwUtil");
const dateUtil = require("./utils/dateUtil");
const validUtil = require("./utils/validUtil");
const router = express.Router();

const saltRounds = 10;
const maxTokenAgeSeconds = 7 * 24 * 60 * 60;

const nameLenRange = [2, 20];
const usernameLenRange = [2, 20];
const emailLenRange = [1, 256];
const descriptionLenRange = [1, 100];
const passwordLenRange = [8, 256];

const iconNumRange = [1, 1];
const heightNumRange = [1, 300];
const heightUnitNumRange = [5, 6];
const genderNumRange = [1, 2];
const activityLevelNumRange = [1, 5];
const ageNumRange = [13, 150];
const bwNumRange = [1, 2000];
const bwUnitNumRange = [1, 2];
const weightGoalNumRange = [1, 7];

const createJWTToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: maxTokenAgeSeconds,
    });
};

const validateUserInfo = (body, initial, tz) => {
    let name = validUtil.validateString("Name", body.name, initial, nameLenRange, true, false, false, false, false);
    if (name.valid === -1) throw Error(name.msg);
    let username = validUtil.validateString("Username", body.username, initial, usernameLenRange, true, false, false, false, false);
    if (username.valid === -1) throw Error(username.msg);
    let email = validUtil.validateString("Email", body.email, false, emailLenRange, false, true, false, false, false);
    if (email.valid === -1) throw Error(email.msg);
    let desc = validUtil.validateString("Description", body.description, false, descriptionLenRange, true, false, false, false, false);
    if (desc.valid === -1) throw Error(desc.msg);
    let pass = validUtil.validateString("Password", body.password, initial, passwordLenRange, true, false, false, false, false);
    if (pass.valid === -1) throw Error(pass.msg);
    let timezone = validUtil.validateString("Timezone", body.tz, initial, [1, 100], true, false, false, false, false);
    if (timezone.valid === -1) throw Error(timezone.msg);

    let heightVal = validUtil.validateNum("Height value", body.height, initial, heightNumRange);
    if (heightVal.valid === -1) throw Error(heightVal.msg);
    let heightIdx = validUtil.validateNum("Height unit index", body.height_unit_fk, initial, heightUnitNumRange);
    if (heightIdx.valid === -1) throw Error(heightIdx.msg);
    let genderIdx = validUtil.validateNum("Gender index", body.gender_fk, initial, genderNumRange);
    if (genderIdx.valid === -1) throw Error(genderIdx.msg);
    let activityIdx = validUtil.validateNum("Activity index", body.activity_level_fk, initial, activityLevelNumRange);
    if (activityIdx.valid === -1) throw Error(activityIdx.msg);
    let weightIdx = validUtil.validateNum("Weight goal index", body.weight_goal_fk, initial, weightGoalNumRange);
    if (weightIdx.valid === -1) throw Error(weightIdx.msg);
    let iconIdx = validUtil.validateNum("Icon index", body.icon_fk, initial, iconNumRange);
    if (iconIdx.valid === -1) throw Error(iconIdx.msg);
    let bwVal = validUtil.validateNum("Bw value", body.bodyweight, initial, bwNumRange);
    if (bwVal.valid === -1) throw Error(bwVal.msg);
    let bwIdx = validUtil.validateNum("Bw unit index", body.bw_unit_fk, initial, bwUnitNumRange);
    if (bwIdx.valid === -1) throw Error(bwIdx.msg);

    let curDate = dateUtil.getDateByTZ(new Date(), tz);
    let dob = dateUtil.getDateFromStr(body.dob);
    let dateMax = curDate.setFullYear(curDate.getFullYear() - ageNumRange[0]);
    let dateMin = curDate.setFullYear(curDate.getFullYear() - ageNumRange[1] + ageNumRange[0]);
    if (dob > dateMax) throw Error("Min age is 13");
    if (dob < dateMin) throw Error("Nobody is that old.");
};

//---------
//
//   GET
//
//---------

// Check if username/email is already taken
router.get("/exists/", async (req, res) => {
    const query = req.query;

    let validTypes = ["email", "username"];

    const sql = `
        SELECT *
        FROM user
        WHERE ${query.type} = ?
    `;

    try {
        if (validTypes.indexOf(query.type) === -1) throw Error("Invalid type.");

        const user = await req.conn.queryAsync(sql, [query.str]);

        util.cleanup(req.conn);
        if (user.length > 0) {
            res.json({ success: { available: false } });
        } else {
            res.json({ success: { available: true } });
        }
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Get full user profile
router.get("/", requireAuth, async (req, res) => {
    const sql = `
            SELECT
            u.name,
            u.username,
            u.email,
            u.description,
            u.dob,
            u.height,
            hu.plur_abbr AS height_unit,
            u.height_unit_fk,
            u.theme,
            wu.plur_abbr AS weight_unit,
            u.bw_unit_fk AS weight_unit_fk,
            g.name AS gender,
            u.gender_fk,
            al.name AS activity_level,
            al.description AS activity_level_description,
            u.activity_level_fk,
            wg.name AS weight_goal,
            u.weight_goal_fk,
            i.location AS icon_location,
            u.created_at
        FROM user AS u
        LEFT JOIN unit AS hu ON u.height_unit_fk = hu.id
        LEFT JOIN unit AS wu ON u.bw_unit_fk = wu.id
        LEFT JOIN gender AS g ON u.gender_fk = g.id
        LEFT JOIN activity_level AS al ON u.activity_level_fk = al.id
        LEFT JOIN icon AS i ON u.icon_fk = i.id
        LEFT JOIN weight_goal AS wg ON u.weight_goal_fk = wg.id
        WHERE u.id = ${req.user.id}
    `;

    try {
        let user = await req.conn.queryAsync(sql);
        user = user[0];

        let curDate = dateUtil.getDateByTZ(new Date(), req.user.tz);
        let bw = await bwUtil.getLastBodyweight(req, req.user.id, dateUtil.getDateStr(curDate, ""));
        if (bw.length > 0) bw = bw[0];
        else bw = null;
        user.weight = bw.weight;

        util.cleanup(req.conn);
        res.json({ user });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

//----------
//
//   POST
//
//----------

// Log a user in
router.post("/login/", async (req, res) => {
    const body = req.body;

    const sql = `
        SELECT *
        FROM user
        WHERE username = ? OR email = ?
    `;

    try {
        const user = await req.conn.queryAsync(sql, [body.user, body.user]);

        if (user.length > 0) {
            const auth = await bcrypt.compare(body.pass, user[0].password);

            if (auth) {
                const token = createJWTToken({ id: user[0].id, tz: body.tz });
                let optionsJwt = { httpOnly: true };
                let optionsUser = {};

                if (body.remember) {
                    optionsJwt.maxAge = maxTokenAgeSeconds * 1000;
                    optionsUser.maxAge = maxTokenAgeSeconds * 1000;
                }

                util.cleanup(req.conn);
                res.cookie("jwt", token, optionsJwt);
                res.cookie("user", "jwtexists", optionsUser);
                res.json({ success: "Login successful." });
            } else {
                throw Error("Wrong password.");
            }
        } else {
            throw Error("Wrong email or username.");
        }
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Log a user out
router.post("/logout/", requireAuth, async (req, res) => {
    util.cleanup(req.conn);
    res.cookie("jwt", "", { maxAge: 1 });
    res.cookie("user", "", { maxAge: 1 });
    res.json({ success: "User has been logged out." });
});

// Sign a user up
router.post("/signup/", async (req, res) => {
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
            weight_goal_fk,
            password,
            theme,
            icon_fk)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        validateUserInfo(body, true, body.tz);

        let hashedPW = await new Promise((resolve, reject) => {
            bcrypt.hash(body.password, saltRounds, async (err, hash) => {
                if (err) reject(err);
                else resolve(hash);
            });
        });

        let dob = dateUtil.getDateFromStr(body.dob);
        let curDate = dateUtil.getDateByTZ(new Date(), body.tz);

        let okPacket = await req.conn.queryAsync(sql, [
            body.name,
            body.username,
            body.email,
            body.description,
            dob,
            body.height,
            body.height_unit_fk,
            body.bw_unit_fk,
            body.gender_fk,
            body.activity_level_fk,
            body.weight_goal_fk,
            hashedPW,
            body.theme,
            body.icon_fk,
        ]);

        let sql2 = `
            INSERT
            INTO bodyweight (
                weight,
                date,
                user_fk)
            VALUES (?, ?, ?)
        `;
        let okPacket2 = await req.conn.queryAsync(sql2, [body.bodyweight, curDate, okPacket.insertId]);

        let okPacket3 = await bwUtil.updateMaintenanceCal(req, okPacket.insertId, dateUtil.getDateStr(curDate, ""), body.tz);

        util.cleanup(req.conn);
        res.json({ success: "User has been created." });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

//---------
//
//   PUT
//
//---------

// Modify a user's account
router.put("/account/", requireAuth, async (req, res) => {
    const body = req.body;

    try {
        validateUserInfo(body, false, req.user.tz);

        let maintenanceFactors = ["dob", "height", "height_unit_fk", "gender_fk", "bw_unit_fk", "activity_level_fk", "weight_goal_fk"];
        let updateStr = util.getUpdateStr(body, maintenanceFactors);

        let sql = `
            UPDATE user
            SET ${updateStr.valueStr}
            WHERE id = ${req.user.id}
        `;

        let okPacket = await req.conn.queryAsync(sql, updateStr.values);

        let curDate = dateUtil.getDateByTZ(new Date(), req.user.tz);

        if (updateStr.affected) {
            let okPacket2 = await bwUtil.updateMaintenanceCal(req, req.user.id, dateUtil.getDateStr(curDate, ""), req.user.tz);
        }

        util.cleanup(req.conn);
        res.json({ success: "Account has been modified." });
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

// Change a user's password
router.put("/password/", requireAuth, async (req, res) => {
    const body = req.body;

    let sql = `
        UPDATE user
        SET password = ?
        WHERE id = ${req.user.id}
    `;

    try {
        const auth = await bcrypt.compare(body.oldPass, req.user.password);

        if (auth) {
            const sameAsOld = await bcrypt.compare(body.newPass, req.user.password);
            if (sameAsOld) throw Error("New password is the same as the old one.");

            let hashedPW = await new Promise((resolve, reject) => {
                bcrypt.hash(body.newPass, saltRounds, async (err, hash) => {
                    if (err) reject(err);
                    else resolve(hash);
                });
            });

            let okPacket = await req.conn.queryAsync(sql, [hashedPW]);

            util.cleanup(req.conn);
            res.json({ success: "Password has been updated." });
        } else {
            throw Error("Old password is wrong.");
        }
    } catch (err) {
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

//------------
//
//   DELETE
//
//------------

// Delete a user's account
router.delete("/", requireAuth, async (req, res) => {
    const body = req.body;

    try {
        const auth = await bcrypt.compare(body.pass, req.user.password);

        if (auth) {
            let id = req.user.id;

            let delete_sql = `
                UPDATE item SET user_fk = 1 WHERE user_fk = ${id};
                UPDATE meal SET user_fk = 1 WHERE user_fk = ${id};
            `;

            let exerciseStr = await util.getDeleteStr(req, "exercise", id, "exercise_fk");
            let liftStr = await util.getDeleteStr(req, "lift", id, "lift_fk");
            let mealStr = await util.getDeleteStr(req, "meal_date", id, "meal_fk");

            if (exerciseStr.length > 0) delete_sql += `DELETE FROM exercise_set WHERE ${exerciseStr};`;
            if (liftStr.length > 0) delete_sql += `DELETE FROM lift_set WHERE ${liftStr};`;
            if (mealStr.length > 0) delete_sql += `DELETE FROM meal_date WHERE ${mealStr};`;

            delete_sql += `
                DELETE FROM exercise WHERE user_fk = ${id};
                DELETE FROM lift WHERE user_fk = ${id};
                DELETE FROM maintenance_calories WHERE user_fk = ${id};
                DELETE FROM bodyweight WHERE user_fk = ${id};
                DELETE FROM user WHERE id = ${id}
            `;

            let sqlArr = delete_sql.split(";");

            await util.runMultipleLinesOfSql(req, sqlArr, "Error with deleting account.");

            util.cleanup(req.conn);
            res.cookie("jwt", "", { maxAge: 1 });
            res.cookie("user", "", { maxAge: 1 });
            res.json({ success: "Account has been deleted." });
        } else {
            throw Error("Password is wrong.");
        }
    } catch (err) {
        console.log(err);
        const errors = util.handleError(err);
        util.cleanup(req.conn);
        res.json({ error: errors });
    }
});

//---------
//
//   404
//
//---------

router.use((req, res) => {
    util.cleanup(req.conn);
    res.status(404).json({ error: "Requested auth endpoint does not exist." });
});

module.exports = router;
