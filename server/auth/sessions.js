const crypto = require("crypto");

const sessions = new Set();
const DEMO_USERNAME = "adm";
const DEMO_PASSWORD = "adm";

function createSession(username, password) {
  if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
    return null;
  }

  const token = crypto.randomBytes(32).toString("hex");
  sessions.add(token);
  return token;
}

function isValidSession(token) {
  return typeof token === "string" && sessions.has(token);
}

function removeSession(token) {
  sessions.delete(token);
}

module.exports = { createSession, isValidSession, removeSession };
