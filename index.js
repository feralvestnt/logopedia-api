const express = require('express');
const cors = require('cors');
const config = require('./server/config/config');
const connectDB = require('./db');

const app = express();


app.use(cors());
app.use(express.json());

app.use('', require('./server/routes/authentication'));

connectDB();

const server = app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});

process.on("unhandledRejection", err => {
  console.error(`Server Crashes: ${err.message}`);
  server.close(() => process.exit(1));
});