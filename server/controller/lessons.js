const Lesson = require("../models/Lesson");

function listLessons(req, res, next) {
  Lesson.find({})
    .sort({ scheduledAt: 1, createdAt: -1 })
    .lean()
    .then((lessons) => res.json(lessons))
    .catch(next);
}

module.exports = { listLessons };
