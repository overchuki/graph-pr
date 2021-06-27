const express = require('express');
const router = express.Router();
const { requireAuth } = require('../auth/authMiddleware');
const authRouter = require('./api/authRouter');
const itemRouter = require('./api/itemRouter');
const mealRouter = require('./api/mealRouter');
const exerciseRouter = require('./api/exerciseRouter');

router.use('/auth', authRouter);
router.use('/item', requireAuth, itemRouter);
router.use('/meal', requireAuth, mealRouter);
router.use('/exercise', requireAuth, exerciseRouter);

router.use((req, res) => {
    res.send({ error: 'Requested api endpoint does not exist.' });
});

module.exports = router;