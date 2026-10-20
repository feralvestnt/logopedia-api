const mongoose = require('mongoose');

let Customer = new mongoose.Schema(
   {
    nome: {
      type: String,
      required: true,
      active: true
    },
    cpf: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    telefone: {
      type: String,
      required: true,
    },
    endereco: {
      type: String,
      required: true,
    },
    observacao: {
      type: String,
      default: "",
    },
    active: {
      type: Boolean,
      default: true,
    },
    voucher: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Customer", Customer);