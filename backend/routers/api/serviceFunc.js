const validator = require('validator');

const millisInYear = 1000 * 60 * 60 * 24 * 365;

const unitMatrix = [
    [-1,    'kg',   'lb',   'km',   'mi',   'cm',   'in',   'ltr',  'mL',   'qt',   'oz',   'g'],
    ['kg',   1,   2.2046,    -1,     -1,     -1,     -1,     -1,     -1,     -1,     -1,     -1],
    ['lb', 0.4536,    1,     -1,     -1,     -1,     -1,     -1,     -1,     -1,     -1,     -1],
    ['km',  -1,      -1,      1,   0.6214,   -1,     -1,     -1,     -1,     -1,     -1,     -1],
    ['mi',  -1,      -1,   1.6093,    1,     -1,     -1,     -1,     -1,     -1,     -1,     -1],
    ['cm',  -1,      -1,     -1,     -1,      1,   0.3937,   -1,     -1,     -1,     -1,     -1],
    ['in',  -1,      -1,     -1,     -1,    2.54,     1,     -1,     -1,     -1,     -1,     -1],
    ['ltr', -1,      -1,     -1,     -1,     -1,     -1,      1,     -1,   1.0526,   -1,     -1],
    ['mL',  -1,      -1,     -1,     -1,     -1,     -1,     -1,      1,     -1,   0.0338,   -1],
    ['qt',  -1,      -1,     -1,     -1,     -1,     -1,    0.95,    -1,      1,     -1,     -1],
    ['oz',  -1,      -1,     -1,     -1,     -1,     -1,     -1,   29.574,   -1,      1,  28.35],
    ['g',   -1,      -1,     -1,     -1,     -1,     -1,     -1,     -1,     -1,   0.0353,    1]
];

const getLocalServerDate = (date, splitBy) => {
    let curDate = date.toLocaleDateString('en-US', { timeZone: 'America/Denver' });
    curDate = curDate.split('/');
    if(curDate[0].length === 1) curDate[0] = '0' + curDate[0];
    if(curDate[1].length === 1) curDate[1] = '0' + curDate[1];
    return curDate[2] + splitBy + curDate[0] + splitBy + curDate[1];
}

const getDateStr = (date, splitBy) => {
    let month = date.getMonth() + 1;
    if(month < 10) month = '0' + month;

    return date.getFullYear() + splitBy + month + splitBy + date.getDate();
}

const getDateFromStr = (dateStr, splitBy) => {
    let date = new Date();
    
}

const convertUnit = (value, convertFrom, convertTo) => {
    if(convertFrom === convertTo) return value;
    
    let factor = unitMatrix[convertFrom][convertTo];
    if(factor === -1) throw Error('Incompatible unit conversion types.');

    return value * factor;
}

const getLastBodyweight = async (req, userId, date) => {
    let sql = `
        SELECT *
        FROM bodyweight
        WHERE user_fk = ${userId} AND date <= '${date}'
        ORDER BY date DESC
        LIMIT 1
    `;
    console.log(sql);

    let bw = await req.conn.queryAsync(sql);
    return bw;
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
        if(required) throw Error('Please fill out all required fields (' + key + ').');
        else return;
    }
    if(value.length < range[0]) throw Error(key + ' is too short.');
    if(value.length > range[1]) throw Error(key + ' is too long.');
    if(isAscii && !validator.isAscii(value)) throw Error('Please use valid characters only (ASCII).');
    if(isEmail && !validator.isEmail(value)) throw Error('Invalid email address.');
}

const checkValidInt = (key, value, required, range) => {
    if(!value){
        if(required) throw Error('Please fill out all required fields (' + key + ').');
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

const updateMaintenanceCal = async (req, userId, updateDate) => {
    let userArr = await req.conn.queryAsync(`SELECT * FROM user WHERE id = ${userId}`);
    let user = userArr[0];

    let dob = new Date(user.dob);
    let curDate = new Date();
    console.log(updateDate)
    let age = (curDate - dob) / millisInYear;

    let latestBodyweight = await getLastBodyweight(req, userId, updateDate);
    if(latestBodyweight.length === 0) throw Error('User does not have recorded bodyweight');

    let deletePacket = await req.conn.queryAsync(`DELETE FROM maintenance_calories WHERE user_fk = ${user.id} AND date = '${updateDate}'`);

    let kgBodyweight = convertUnit(latestBodyweight[0].weight, user.bw_unit_fk, 1);

    let cmHeight = convertUnit(user.height, user.height_unit_fk, 5);

    let bmr = await getBMR(req, kgBodyweight, cmHeight, age, user.gender_fk);
    let main_cal = await getMaintenanceCal(req, bmr, user.activity_level_fk);

    let sql = `
        INSERT
        INTO maintenance_calories (
            bmr,
            calories,
            date,
            activity_level_fk,
            user_fk)
        VALUES (?, ?, ?, ?, ?)
    `;
    let okPacket = await req.conn.queryAsync(sql, [bmr, main_cal, updateDate, user.activity_level_fk, user.id]);
    return okPacket;
}

const runMultipleLinesOfSql = async (req, sqlArr, errMessage) => {
    for(let sql of sqlArr){
        if(sql.length === 0) continue;
        try{
            await req.conn.queryAsync(sql);
        }catch(err){
            console.log(errMessage, sql);
            throw err;
        }
    }
}

const getMealTotals = async (req, mealId) => {
    let sql = `
        SELECT
            SUM(item.calories * meal_item.item_percentage) AS calories,
            SUM(item.protein * meal_item.item_percentage) AS protein,
            SUM(item.carbs * meal_item.item_percentage) AS carbs,
            SUM(item.fat * meal_item.item_percentage) AS fat,
            SUM(item.cost * meal_item.item_percentage) AS cost
        FROM meal_item
        LEFT JOIN item ON meal_item.item_fk = item.id
        WHERE meal_item.meal_fk = ${mealId}
    `;

    let totals = await req.conn.queryAsync(sql);

    return totals[0];
}

const getMealItems = async (req, mealId) => {
    let sql = `
        SELECT
            mi.item_percentage AS percent,
            i.name,
            i.calories * mi.item_percentage AS calories,
            i.protein * mi.item_percentage AS protein,
            i.carbs * mi.item_percentage AS carbs,
            i.fat * mi.item_percentage AS fat,
            i.cost * mi.item_percentage AS cost,
            i.serving_size * mi.item_percentage AS serving_size,
            (IF(i.serving_size * mi.item_percentage = 1, u.sing_abbr, u.plur_abbr)) AS unit,
            icon.location,
            ic.name AS category
        FROM meal_item AS mi
        LEFT JOIN item AS i ON mi.item_fk = i.id
        LEFT JOIN unit AS u ON i.serving_size_unit_fk = u.id
        LEFT JOIN item_category AS ic ON i.category_fk = ic.id
        LEFT JOIN icon ON i.icon_fk = icon.id
        WHERE mi.meal_fk = ${mealId}
    `;

    let items = await req.conn.queryAsync(sql);

    return items;
}

const getDateTotals = (mealTotals) => {
    let totals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        cost: 0
    }
    
    for(let meal of mealTotals){
        for(let key of Object.keys(totals)){
            totals[key] += parseInt(meal[key]);
        }
    }
    
    return totals;
}

module.exports = {
    getDateStr,
    checkValidStr,
    checkValidInt,
    getBMR,
    getMaintenanceCal,
    updateMaintenanceCal,
    getUpdateStr,
    runMultipleLinesOfSql,
    getMealItems,
    getMealTotals,
    getDateTotals,
    convertUnit,
    getLastBodyweight,
    getLocalServerDate
}