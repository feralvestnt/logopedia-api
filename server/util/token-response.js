const jwt = require("jsonwebtoken");

module.exports = (res, params) => {
  const { success, message, user } = params;

  const token = getJwtToken(user);

  let COOKIE_EXPIRE = '30d';
  const options = {
    expires: new Date(Date.now() + parseInt(COOKIE_EXPIRE)),
    httpOnly: true
  };

  res
    .status(200)
    .cookie("token", token, options)
    .json({ success: success, message: message, token: token, roles: user.role });
};

const getJwtToken = function(user) {
  const JWT_SECRET = 'football_jwt_s3cr3t';
  return jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: "30d"
  });
};