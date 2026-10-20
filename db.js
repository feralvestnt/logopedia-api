const mongoose = require("mongoose");

//const MONGO_URI = "mongodb+srv://fernandohalves0:NoraunIoOe4kgSmY@sport-score-free.knhchij.mongodb.net/sport-score?retryWrites=true&w=majority&appName=sport-score-free";
const MONGO_URI = "mongodb+srv://fernandohalves0_db_user:dJ5gYTvuZg0quMLa@cluster-restaurantes-br.pwbxuyu.mongodb.net/restaurante-regina?retryWrites=true&w=majority&appName=restaurantes-brasil";

//const MONGO_URI = process.env.MONGO_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = dbConnect;
