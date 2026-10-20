const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

let User = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [
        true,
        `${'A obrigatArio'.replace(
          "{{field}}",
          "FirstName"
        )}`
      ]
    },
    lastName: {
      type: String,
      required: [
        true,
        `${'A obrigatArio'.replace(
          "{{field}}",
          "lastName"
        )}`
      ]
    },
    user: {
      type: String,
      required: [
        true,
        `${'A obrigatArio'.replace(
          "{{field}}",
          "user"
        )}`
      ],
      unique: true
    },
    email: {
      type: String,
      required: [
        true,
        `${'A obrigatArio'.replace(
          "{{field}}",
          "E-Mail"
        )}`
      ],
      unique: true,
      match: [
        /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        `${'A obrigatArio'.replace(
          "{{field}}",
          "E-Mail"
        )}`
      ]
    },
    password: {
      type: String,
      required: [
        false,
        `${'A obrigatArio'.replace(
          "{{field}}",
          "password"
        )}`
      ],
      minlength: 8,
      select: false
    },
    role: [
      {
        type: String,
        enum: ["total"],
        default: "user"
      }
    ],
    passwordResetToken: String,
    passwordResetExpire: Date,
    active: { type: Boolean, default: false }
  },
  { versionKey: false, timestamps: true }
);

User.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("user", User);
