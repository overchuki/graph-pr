const express = require('express');
const router = express.Router();
const serviceFunc = require('./serviceFunc');

const handleError = (err) => {
    console.log(err);
    return err.message;
}


//---------
//
//   GET
//
//---------




//----------
//
//   POST
//
//----------




//---------
//
//   PUT
//
//---------




//------------
//
//   DELETE
//
//------------





//---------
//
//   404
//
//---------

router.use((req, res) => {
    res.send({ error: 'Requested lift endpoint does not exist.' });
});

module.exports = router;