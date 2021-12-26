const express = require("express");
const router = express.Router();
const util = require("./utils/util");
const validUtil = require("./utils/validUtil");

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
    util.cleanup(req.conn);
    res.json({ error: "Requested exercise endpoint does not exist." });
});

module.exports = router;
