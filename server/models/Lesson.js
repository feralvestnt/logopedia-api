const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    scheduledAt: {
      type: Date,
      default: null,
      index: true,
    },
    durationMinutes: {
      type: Number,
      min: 1,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", LessonSchema);
