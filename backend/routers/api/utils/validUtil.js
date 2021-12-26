const validator = require("validator");

// Define how dates can be divided
// Note: Only works in validateString, delimiters not specified when verifying date in validator library
const dateDelimiters = ["-", "/", "."];

// Validate string according to parameters
//                      (key, value, required, range, isAscii, isEmail, isAlpha)
const validateString = (strName, str, required, lenRange, ascii, email, alpha, alphaNum, date) => {
    if (required && !str) {
        return { valid: -1, msg: strName + " is required." };
    } else if (str) {
        if (str.length < lenRange[0]) return { valid: -1, msg: strName + " is too short." };
        if (str.length > lenRange[1]) return { valid: -1, msg: strName + " is too long." };
        if (alpha && !validator.isAlpha(str)) return { valid: -1, msg: strName + " is not alpha." };
        if (alphaNum && !validator.isAlphanumeric(str)) return { valid: -1, msg: strName + " is not alphanumeric." };
        if (ascii && !validator.isAscii(str)) return { valid: -1, msg: strName + " is not ascii." };
        if (date && !validator.isDate(str, { delimiters: dateDelimiters })) return { valid: -1, msg: strName + " is not a date." };
        if (email && !validator.isEmail(str)) return { valid: -1, msg: strName + " is not an email." };
    }

    return { valid: 1, msg: strName + " is valid." };
};

// Validate number according to parameters
const validateNum = (numName, num, required, range) => {
    if (required && !num && num !== 0) {
        return { valid: -1, msg: numName + " is required." };
    } else if (num || num === 0) {
        if (typeof num !== "number") return { valid: -1, msg: numName + " is not a number." };
        if (num < range[0]) return { valid: -1, msg: numName + " is too small." };
        if (num > range[1]) return { valid: -1, msg: numName + " is too large." };
    }

    return { valid: 1, msg: numName + " is valid." };
};

// Validate date according to parameters
const validateDate = (dateName, dateStr, dateRange, required) => {
    if (required && !dateStr) {
        return { valid: -1, msg: dateName + " is required." };
    } else if (dateStr) {
        try {
            if (validator.isAfter(dateStr, dateRange[1])) return { valid: -1, msg: dateName + " is after the max date." };
            if (validator.isBefore(dateStr, dateRange[0])) return { valid: -1, msg: dateName + " is before the min date." };
        } catch (err) {
            return { valid: -1, msg: "Invalid date format." };
        }
    }

    return { valid: 1, msg: dateName + " is valid." };
};

module.exports = {
    validateString,
    validateNum,
    validateDate,
};
