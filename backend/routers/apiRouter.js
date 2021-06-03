const express = require('express');
const router = express.Router();
const { db } = require('../db');
const authRouter = require('../auth/auth');

router.use(db);

router.use('/auth', authRouter);

router.use((req, res) => {
    res.send({ error: 'Requested api endpoint does not exist.' });
});

module.exports = router;