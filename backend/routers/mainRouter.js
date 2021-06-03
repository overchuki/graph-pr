const express = require('express');
const router = express.Router();
const frontendProxy = require('./frontendProxy');
const apiRouter = require('./apiRouter');

router.use('/api', apiRouter);
// router.use('/', frontendProxy);

module.exports = router;