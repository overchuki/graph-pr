const dateUtil = require("./dateUtil");
const millisInYear = 1000 * 60 * 60 * 24 * 365;

const getLastBodyweight = async (req, userId, date) => {
    let sql = `
        SELECT *
        FROM bodyweight
        WHERE user_fk = ${userId} AND date <= '${date}'
        ORDER BY date DESC
        LIMIT 1
    `;

    let bw = await req.conn.queryAsync(sql);
    return bw;
};

const getBMR = async (req, bodyweight, height, age, gender) => {
    let bmr = 10 * bodyweight + 6.25 * height - 5 * age;

    let genderNum = await req.conn.queryAsync(`SELECT bmr_num FROM gender WHERE id = ${gender}`);
    if (genderNum.length === 0) throw Error("Invalid gender index.");

    bmr += genderNum[0].bmr_num;

    return Math.round(bmr);
};

const getMaintenanceCal = async (req, bmr, activity_level) => {
    let sql = `
        SELECT bmr_multiplier
        FROM activity_level
        WHERE id = ${activity_level}
    `;

    let multiplier = await req.conn.queryAsync(sql);
    if (multiplier.length === 0) throw Error("Invalid activity level index.");

    return Math.round(bmr * multiplier[0].bmr_multiplier);
};

const updateMaintenanceCal = async (req, userId, updateDate, tz) => {
    let userArr = await req.conn.queryAsync(`SELECT * FROM user WHERE id = ${userId}`);
    let user = userArr[0];

    let dob = dateUtil.getDateByTZ(user.dob, tz);
    let curDate = dateUtil.getDateByTZ(new Date(), tz);
    let age = (curDate - dob) / millisInYear;

    let latestBodyweight = await getLastBodyweight(req, userId, updateDate);
    if (latestBodyweight.length === 0) throw Error("User does not have recorded bodyweight");

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
            weight_goal_fk,
            user_fk)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    let okPacket = await req.conn.queryAsync(sql, [bmr, main_cal, updateDate, user.activity_level_fk, user.weight_goal_fk, user.id]);
    return okPacket;
};

module.exports = {
    getLastBodyweight,
    getBMR,
    getMaintenanceCal,
    updateMaintenanceCal,
};
