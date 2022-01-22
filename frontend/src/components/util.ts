import validator from "validator";

type ErrorType = string | boolean;

type BasicVerifyFunc = (
    name: string,
    value: string,
    required: boolean,
    range: [number, number],
    int: boolean,
    email: boolean,
    ascii: boolean,
    alphaNum: boolean
) => ErrorType;

type DobVerifyFunc = (value: string) => { error: ErrorType; formatted?: string };

// OLD ORDER: name, int, value, required, range, email, ascii

export const basicVerify: BasicVerifyFunc = (name, value, required, range, int, email, ascii, alphaNum) => {
    let error: ErrorType = false;

    if (!value) {
        if (required) error = `Please enter ${name}.`;
        else error = "skip";
    }

    name = name.split(" ")[1];
    name = name.charAt(0).toUpperCase() + name.slice(1);

    if (!error && alphaNum && !validator.isAlphanumeric(value + "")) error = `${name} is invalid.`;

    if (!int) {
        if (!error && email && !validator.isEmail(value + "")) error = `${name} is invalid.`;
        if (!error && ascii && !validator.isAscii(value + "")) error = `${name} is invalid.`;

        if (!error && value.length < range[0]) error = `${name} is too short.`;
        if (!error && value.length > range[1]) error = `${name} is too long.`;
    } else {
        try {
            let valueInt: number = parseInt(value);
            if (!error && valueInt < range[0]) error = `${name} is too small.`;
            if (!error && valueInt > range[1]) error = `${name} is too large.`;
        } catch (err) {
            error = "Invalid type";
        }
    }

    if (error === "skip") return false;

    return error;
};

export const dobVerify: DobVerifyFunc = (value) => {
    const ageRange: [number, number] = [13, 150];
    let curDate: Date = new Date();
    let dateMax: Date = new Date(curDate.setFullYear(curDate.getFullYear() - ageRange[0]));
    let dateMin: Date = new Date(curDate.setFullYear(curDate.getFullYear() - ageRange[1] + ageRange[0]));

    let valArr: Array<string> = value.split("/");
    if (value.length !== 10 || valArr.length !== 3) return { error: "Invalid (MM/DD/YYYY)" };

    let month: number = parseInt(valArr[0]);
    if (!month || month < 1 || month > 12) return { error: "Invalid Month (1-12)" };
    month--;
    let day: number = parseInt(valArr[1]);
    if (!day || day < 1 || day > 31) return { error: "Invalid Day (1-31)" };
    let year: number = parseInt(valArr[2]);
    if (!year) return { error: "Invalid Year (YYYY)" };

    let dob: Date = new Date();
    dob.setFullYear(year, month, day);
    dob.setHours(0, 0, 0);
    if (dob > dateMax) return { error: "Must be at least 13." };
    if (dob < dateMin) return { error: "That's not possible." };

    month++;
    const formattedVal = `${year}${month < 10 ? "0" + month : month}${day < 10 ? "0" + day : day}`;
    return { error: false, formatted: formattedVal };
};

export const dateToString = (date: Date): string => {
    let month = date.getMonth() + 1;
    let monthStr = month + "";
    if (month < 10) monthStr = "0" + month;

    let dateNum = date.getDate();
    let dateStr = dateNum + "";
    if (dateNum < 10) dateStr = "0" + dateNum;

    return date.getFullYear() + monthStr + dateStr;
};

export const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.substring(1, str.length);
};
