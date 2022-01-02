const getTheoMax = (weight, reps) => {
    if (reps === 1) return weight;
    return (weight / (1 - 0.025 * reps)).toFixed(2);
};

const getLiftInfo = async (req, liftId) => {
    let sql = `
        SELECT
            l.id,
            l.name,
            u.plur_abbr,
            lmax.weight AS max,
            lmax.reps AS max_reps,
            ltheo.theomax,
            ltheo.weight AS theomax_weight,
            ltheo.reps AS theomax_reps,
            w.name,
            l.created_at
        FROM lift AS l
        LEFT JOIN workout AS w ON l.workout_fk = w.id
        LEFT JOIN lift_set AS lmax ON l.max_set = lmax.id
        LEFT JOIN lift_set AS ltheo ON l.theomax_set = ltheo.id
        LEFT JOIN unit AS u ON l.unit_fk = u.id
        WHERE l.id = ${liftId}
    `;

    let info = await req.conn.queryAsync(sql);
    if (info.length === 0) throw Error("Requested lift does not exist.");

    let duration = await getLiftDuration(req, liftId);
    info[0].duration = duration;

    return info[0];
};

const getWorkoutInfo = async (req, wId) => {
    let sql = `
        SELECT
            w.id,
            w.name,
            w.description,
            w.days,
            w.liftCnt,
            w.created_at
        FROM workout AS w
        WHERE w.id = ${liftId}
    `;

    let info = await req.conn.queryAsync(sql);
    if (info.length === 0) throw Error("Requested workout does not exist.");

    return info[0];
};

const updateLiftMax = async (req, liftId) => {
    let sqlMax = `
        SELECT id
        FROM lift_set
        WHERE weight = (SELECT MAX(weight) FROM lift_set) AND lift_fk = ?
        ORDER BY reps DESC
        LIMIT 1
    `;

    let sqlTheoMax = `
        SELECT id
        FROM lift_set
        WHERE theomax = (SELECT MAX(theomax) FROM lift_set) AND lift_fk = ?
        ORDER BY reps DESC
        LIMIT 1
    `;

    let max = await req.conn.queryAsync(sqlMax, [liftId]);
    let theomax = await req.conn.queryAsync(sqlTheoMax, [liftId]);
    if (max.length === 0 || theomax.length === 0) throw Error("Lift has no sets yet.");

    let sqlUpdate = `
        UPDATE lift
        SET
            max_set = ${max[0].id},
            theomax_set = ${theomax[0].id}
        WHERE id = ${liftId}
    `;

    let okPacket = await req.conn.queryAsync(sqlUpdate);
    return okPacket;
};

const getLiftDuration = async (req, liftId) => {
    let sqlDuration = `
        SELECT
            DATEDIFF(MAX(date), MIN(date)) AS duration
        FROM lift_set
        WHERE lift_fk = ${liftId}
    `;

    let duration = await req.conn.queryAsync(sqlDuration);
    if (duration.length === 0) throw Error("Lift has no sets yet.");

    return duration[0].duration;
};

const getLiftSets = async (req, liftId) => {
    let sqlMaxSet = `
        SELECT MAX(set_num) AS max
        FROM lift_set
        WHERE lift_fk = ${liftId}
    `;

    let maxSetNum = await req.conn.queryAsync(sqlMaxSet);

    let sql = `
        SELECT *
        FROM lift_set
        WHERE lift_fk = ${liftId} AND set_num = ?
        ORDER BY date ASC
    `;

    let setArray = [];

    for (let i = 0; i < maxSetNum[0].max; i++) {
        let sets = await req.conn.queryAsync(sql, [i + 1]);
        setArray.push(sets);
    }

    return setArray;
};

const checkExistingLiftSet = async (req, liftId, date) => {
    let dateSet = await req.conn.queryAsync(`SELECT * FROM lift_set WHERE date = '${date}' AND lift_fk = ${liftId}`);
    return dateSet;
};

module.exports = {
    getTheoMax,
    getLiftInfo,
    getWorkoutInfo,
    updateLiftMax,
    getLiftDuration,
    getLiftSets,
    checkExistingLiftSet,
};
