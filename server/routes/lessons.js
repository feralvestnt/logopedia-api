const router = require("express").Router();
const { listLessons } = require("../controller/lessons");
const requireAuth = require("../middleware/requireAuth");

router.get("/", requireAuth, listLessons);

module.exports = router;
