// GET TIMEZONE
// Intl.DateTimeFormat().resolvedOptions().timeZone

const getDateByTZ = (date, tz) => {
    if (!date) return;
    let dateStr = getDateStrByTZ(date, "", tz);
    let realDate = getDateFromStr(dateStr);

    return realDate;
};

const getDateStrByTZ = (date, splitBy, tz) => {
    if (!date) return;
    let curDate = date.toLocaleDateString("en-US", { timeZone: tz });
    curDate = curDate.split("/");
    if (curDate[0].length === 1) curDate[0] = "0" + curDate[0];
    if (curDate[1].length === 1) curDate[1] = "0" + curDate[1];
    return curDate[2] + splitBy + curDate[0] + splitBy + curDate[1];
};

const getDateStr = (date, splitBy) => {
    if (!date) return;
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;

    return date.getFullYear() + splitBy + month + splitBy + day;
};

const getDateFromStr = (dateStr) => {
    if (!dateStr) return;
    dateStr = dateStr.split("-").join("");
    dateStr = dateStr.split("/").join("");
    if (dateStr.length != 8) throw Error("Invalid date string format.");
    let date = new Date();
    let year = parseInt(dateStr.substring(0, 4));
    let month = parseInt(dateStr.substring(4, 6)) - 1;
    let day = parseInt(dateStr.substring(6, 8));

    date.setFullYear(year, month, day);
    date.setHours(0, 0, 0);

    return date;
};

module.exports = {
    getDateByTZ,
    getDateStrByTZ,
    getDateStr,
    getDateFromStr,
};
