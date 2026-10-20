const { isValidSession } = require("../auth/sessions");

function requireAuth(req, res, next) {
  const authorization = req.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !isValidSession(token)) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  req.sessionToken = token;
  return next();
}

module.exports = requireAuth;
