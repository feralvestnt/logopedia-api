const router = require("express").Router();

const {
  getMatches,
  getMatchesLiveV1,
  getMatchesLiveV2
} = require("../controller/matches");

router
  .route("/")
  .get(getMatches);


module.exports = router;