const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
    res.send('Login Endpoint');
});

router.post('/signup', (req, res) => {
    res.send('Signup endpoint');
});

router.use((req, res) => {
    res.status(404).send({ error: 'Requested auth endpoint does not exist.' });
});

module.exports = router;