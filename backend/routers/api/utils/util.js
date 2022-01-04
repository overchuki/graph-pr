const validator = require("validator");

const unitMatrix = [
    [-1, "kg", "lb", "km", "mi", "cm", "in", "ltr", "mL", "qt", "oz", "g"],
    ["kg", 1, 2.2046, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    ["lb", 0.4536, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    ["km", -1, -1, 1, 0.6214, -1, -1, -1, -1, -1, -1, -1],
    ["mi", -1, -1, 1.6093, 1, -1, -1, -1, -1, -1, -1, -1],
    ["cm", -1, -1, -1, -1, 1, 0.3937, -1, -1, -1, -1, -1],
    ["in", -1, -1, -1, -1, 2.54, 1, -1, -1, -1, -1, -1],
    ["ltr", -1, -1, -1, -1, -1, -1, 1, -1, 1.0526, -1, -1],
    ["mL", -1, -1, -1, -1, -1, -1, -1, 1, -1, 0.0338, -1],
    ["qt", -1, -1, -1, -1, -1, -1, 0.95, -1, 1, -1, -1],
    ["oz", -1, -1, -1, -1, -1, -1, -1, 29.574, -1, 1, 28.35],
    ["g", -1, -1, -1, -1, -1, -1, -1, -1, -1, 0.0353, 1],
];

const handleError = (err) => {
    console.error(err);
    return err.message;
};

const convertUnit = (value, convertFrom, convertTo) => {
    if (convertFrom === convertTo) return value;

    let factor = unitMatrix[convertFrom][convertTo];
    if (factor === -1) throw Error("Incompatible unit conversion types.");

    return value * factor;
};

const getUpdateStr = (body, affectedArray) => {
    let valueStr = "";
    let values = [];
    let keys = Object.keys(body);
    let affected = false;

    if (keys.length === 0) throw Error("Please modify something.");

    for (let i = 0; i < keys.length; i++) {
        if (!body[keys[i]]) continue;

        if (affectedArray.includes(keys[i])) affected = true;

        valueStr += `${keys[i]} = ?,`;
        values.push(body[keys[i]]);
    }

    valueStr = valueStr.substring(0, valueStr.length - 1);

    return {
        valueStr,
        values,
        affected,
    };
};

const getDeleteStr = async (req, db, userId, key) => {
    let entries = await req.conn.queryAsync(`SELECT id FROM ${db} WHERE user_fk = ${userId}`);
    let entriesStr = "";

    for (let entryId of entries) entriesStr += key + ` = ${entryId} OR `;
    entriesStr = entriesStr.substring(0, entriesStr.length - 3);

    return entriesStr;
};

const runMultipleLinesOfSql = async (req, sqlArr, errMessage) => {
    for (let sql of sqlArr) {
        if (sql.length === 0) continue;
        try {
            await req.conn.queryAsync(sql);
        } catch (err) {
            console.log(errMessage, sql);
            throw err;
        }
    }
};

// Release the connection once done using it so server doesn't back up
const cleanup = (conn) => {
    conn.release();
};

module.exports = {
    getUpdateStr,
    runMultipleLinesOfSql,
    convertUnit,
    handleError,
    getDeleteStr,
    cleanup,
};
