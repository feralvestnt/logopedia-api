const router = require("express").Router();
const { listLessons } = require("../controller/lessons");

router.get("/", listLessons);

module.exports = router;
