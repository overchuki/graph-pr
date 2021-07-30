const express = require("express");
const router = express.Router();
const serviceFunc = require("./serviceFunc");

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
  res.send({ error: "Requested exercise endpoint does not exist." });
});

module.exports = router;
