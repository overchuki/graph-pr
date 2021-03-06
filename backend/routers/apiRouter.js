const express = require("express");
const router = express.Router();
const { requireAuth } = require("../auth/authMiddleware");
const { cleanup } = require("./api/utils/util");

const authRouter = require("./api/authRouter");
const itemRouter = require("./api/itemRouter");
const mealRouter = require("./api/mealRouter");
const exerciseRouter = require("./api/exerciseRouter");
const liftRouter = require("./api/liftRouter");
const bwRouter = require("./api/bodyweightRouter");

router.use("/auth", authRouter);
router.use("/item", requireAuth, itemRouter);
router.use("/meal", requireAuth, mealRouter);
router.use("/exercise", requireAuth, exerciseRouter);
router.use("/lift", requireAuth, liftRouter);
router.use("/bw", requireAuth, bwRouter);

router.use((req, res) => {
    cleanup(req.conn);
    res.json({ error: "Requested api endpoint does not exist." });
});

module.exports = router;
