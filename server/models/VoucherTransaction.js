const mongoose = require('mongoose');

const VoucherTransactionSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    type: { type: String, enum: ['VENDA', 'DEBITO', 'ESTORNO_VENDA', 'ESTORNO_DEBITO'], required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    balanceBefore: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true, min: 0 },
    clientName: { type: String, required: true },
    clientCpf: { type: String, required: true },
    status: { type: String, enum: ['ATIVA', 'ESTORNADA'], default: 'ATIVA', index: true },
    reason: { type: String, trim: true, maxlength: 500 },
    reversalOf: { type: mongoose.Schema.Types.ObjectId, ref: 'VoucherTransaction', default: null },
    reversalTransaction: { type: mongoose.Schema.Types.ObjectId, ref: 'VoucherTransaction', default: null },
    reversedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

VoucherTransactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('VoucherTransaction', VoucherTransactionSchema);
