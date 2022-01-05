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
            lpmax.date AS max_date,
            ltheo.theomax,
            ltheo.weight AS theomax_weight,
            ltheo.reps AS theomax_reps,
            lptheo.date AS theomax_date,
            w.name AS workout_name,
            l.created_at
        FROM lift AS l
        LEFT JOIN workout AS w ON l.workout_fk = w.id
        LEFT JOIN lift_set AS lmax ON l.max_set = lmax.id
        LEFT JOIN lift_set_parent AS lpmax ON lmax.lift_set_parent_fk = lpmax.id
        LEFT JOIN lift_set AS ltheo ON l.theomax_set = ltheo.id
        LEFT JOIN lift_set_parent AS lptheo ON ltheo.lift_set_parent_fk = lptheo.id
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
        WHERE w.id = ${wId}
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
        FROM lift_set_parent
        WHERE lift_fk = ${liftId}
    `;

    let duration = await req.conn.queryAsync(sqlDuration);
    if (duration.length === 0) throw Error("Lift has no sets yet.");

    return duration[0].duration;
};

const getLiftSets = async (req, liftId) => {
    let setSql = `
        SELECT
            s.set_num,
            s.weight,
            s.reps,
            s.theomax,
            lp.top_set,
            lp.date,
            lp.set_quantity
        FROM lift_set as s
        LEFT JOIN lift_set_parent AS lp ON s.lift_set_parent_fk = lp.id
        WHERE s.lift_fk = ${liftId}
        ORDER BY lp.date ASC, s.set_num ASC
    `;

    let sets = await req.conn.queryAsync(setSql);

    return sets;
};

const checkExistingLiftSet = async (req, liftId, date) => {
    let dateSet = await req.conn.queryAsync(`SELECT * FROM lift_set_parent WHERE date = '${date}' AND lift_fk = ${liftId}`);
    return dateSet;
};

const updateLiftCnt = async (req, wId) => {
    let sql = `
        UPDATE workout
        SET liftCnt = (SELECT COUNT(*) FROM lift WHERE workout_fk = ${wId})
        WHERE id = ${wId}
    `;

    let okPacket = await req.conn.queryAsync(sql);

    return okPacket;
};

module.exports = {
    getTheoMax,
    getLiftInfo,
    getWorkoutInfo,
    updateLiftMax,
    getLiftDuration,
    getLiftSets,
    checkExistingLiftSet,
    updateLiftCnt,
};
