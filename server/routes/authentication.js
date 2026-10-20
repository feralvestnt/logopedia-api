const router = require("express").Router();
const { login, verify, logout } = require("../controller/authentication");

router.post("/login", login);
router.get("/verify", verify);
router.post("/logout", logout);

module.exports = router;
