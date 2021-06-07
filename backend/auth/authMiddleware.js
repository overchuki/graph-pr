require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyUser = async (req, res, next) => {
    const token = req.cookies.jwt;

    if(token){
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if(!decodedToken){
            req.user = null;
        }else{
            const sql = `
                SELECT *
                FROM user
                WHERE id = ?
            `;
            const user = await req.conn.queryAsync(sql, [decodedToken.id]);
            
            if(user.length > 0){
                req.user = user[0];
            }else{
                req.user = null;
            }
        }
    }else{
        req.user = null;
    }
    next();
}

const requireAuth = async (req, res, next) => {
    if(!req.user){
        res.status(400).send({ error: 'This endpoint requires authenticated jwt token.' });
    }else{
        next();
    }
}

module.exports = {
    verifyUser,
    requireAuth
}