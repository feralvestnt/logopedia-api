require("dotenv").config();

const express = require("express");
const cors = require("cors");
const config = require("./server/config/config");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", require("./server/routes/authentication"));
app.use("/lessons", require("./server/routes/lessons"));

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "The API could not complete the request." });
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`Logopedia API is running on port ${config.port}`);
  });
}

module.exports = app;
