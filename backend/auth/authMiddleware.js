require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyUser = async (req, res, next) => {
    next();
}

const requireAuth = async (req, res, next) => {
    next();
}

module.exports = {
    verifyUser,
    requireAuth
}