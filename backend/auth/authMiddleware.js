require("dotenv").config();
const jwt = require("jsonwebtoken");
const { cleanup } = require("../routers/api/utils/util");

const verifyUser = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedToken) {
            req.user = null;
        } else {
            const sql = `
                SELECT *
                FROM user
                WHERE id = ?
            `;
            const user = await req.conn.queryAsync(sql, [decodedToken.id]);

            if (user.length > 0) {
                req.user = user[0];
                req.user.tz = decodedToken.tz;
            } else {
                req.user = null;
            }
        }
    } else {
        req.user = null;
    }
    next();
};

const requireAuth = async (req, res, next) => {
    if (!req.user) {
        cleanup(req.conn);
        res.status(400).json({ error: "This endpoint requires authenticated jwt token." });
    } else {
        next();
    }
};

module.exports = {
    verifyUser,
    requireAuth,
};
