const router = require("express").Router();

router.use("/matches", require("./matches"));
router.use("/authentication", require("./authentication"));

module.exports = router;
