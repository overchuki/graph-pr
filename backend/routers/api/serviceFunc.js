const validator = require('validator');

const millisInYear = 1000 * 60 * 60 * 24 * 365;

const lbToKgFactor = 0.45359237;
const kgToLbFactor = 2.20462262;
const inToCmFactor = 2.54;
const cmToInFactor = 0.393700787;

const getDateStr = (date) => {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}

const getUpdateStr = (body, affectedArray) => {
    let valueStr = '';
    let values = [];
    let keys = Object.keys(body);
    let affected = false;

    if(keys.length === 0) throw Error('Please modify something.');
    
    for(let i = 0;i < keys.length; i++){
        if(!body[keys[i]]) continue;
        
        if(affectedArray.includes(keys[i])) affected = true;
        
        valueStr += `${keys[i]} = ?,`;
        values.push(body[keys[i]]);
    }

    valueStr = valueStr.substring(0, valueStr.length-1);

    return {
        valueStr,
        values,
        affected
    }
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

const getTotalMacros = (itemArray) => {

}

module.exports = {
    getDateStr,
    checkValidStr,
    checkValidInt,
    getBMR,
    getMaintenanceCal,
    updateMaintenanceCal,
    getUpdateStr,
    getTotalMacros
}