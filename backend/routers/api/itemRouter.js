const express = require('express');
const router = express.Router();



router.use((req, res) => {
    res.send({ error: 'Requested api endpoint does not exist.' });
});

module.exports = router;