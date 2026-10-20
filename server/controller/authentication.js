const {
  createSession,
  isValidSession,
  removeSession,
} = require("../auth/sessions");

function login(req, res) {
  const { username, password } = req.body || {};
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const token = createSession(username, password);
  if (!token) {
    return res.status(401).json({ message: "The username or password is incorrect." });
  }

  return res.json({ token, username });
}

function verify(req, res) {
  const authorization = req.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !isValidSession(token)) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  return res.json({ valid: true, username: "adm" });
}

function logout(req, res) {
  const authorization = req.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");
  if (scheme === "Bearer") removeSession(token);
  return res.status(204).end();
}

module.exports = { login, verify, logout };
