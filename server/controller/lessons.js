const Lesson = require("../models/Lesson");
const connectDB = require("../../db");

async function listLessons(req, res, next) {
  if (process.env.USE_MONGODB !== "true") {
    return res.json([]);
  }

  try {
    await connectDB();
  } catch (error) {
    return next(error);
  }

  return Lesson.find({})
    .sort({ scheduledAt: 1, createdAt: -1 })
    .lean()
    .then((lessons) => res.json(lessons))
    .catch(next);
}

module.exports = { listLessons };
