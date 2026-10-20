const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const CustomError = require("../util/error").CustomError;
const jwt = require("jsonwebtoken");
const tokenResponse = require("../util/token-response");
const User = require("../models/User");
const Customer = require("../models/Customer");
const VoucherTransaction = require("../models/VoucherTransaction");
const nodemailer = require("nodemailer");

exports.saveCustomers = async (req, res, next) => {
  
  try {
    const newCliente = await Customer.create(req.body);
  console.log('client ', req.body)
    return res.status(201).json({
      message: "Cliente cadastrado com sucesso!",
      cliente: newCliente
    });

  } catch (error) {
    console.error("Erro ao cadastrar cliente:", error);

    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}

exports.customers = async (req, res, next) => {
  try {
    const customers = await Customer.find();
    const activeCustomers = customers.filter(customer => customer.active === true);
    return res.status(200).json({ customers: activeCustomers });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

exports.customerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invAlido" });
    }

    const customer = await Customer.findOne({ _id: id});

    if (!customer) {
      return res.status(404).json({ error: "Cliente nAo encontrado" });
    }

    return res.status(200).json({ customer });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

exports.customerUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invAlido" });
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ error: "Cliente nAo encontrado" });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      message: "Cliente atualizado com sucesso!",
      cliente: updatedCustomer,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: messages });
    }

    if (error.code === 11000) {
      return res.status(409).json({ error: "CPF jA cadastrado" });
    }

    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

exports.customerDeleted = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invAlido" });
    }

    const customer = await Customer.findByIdAndUpdate(id, {
      ...req.body,
      active: false,
    },
    {
      new: true,
      runValidators: true
    }
  )

    if (!customer) {
      return res.status(404).json({ error: "Cliente nAo encontrado" });
    }

    return res.status(200).json({
      message: "Cliente removido com sucesso!",
      cliente: customer,
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

exports.sellAmount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const amount = Number(req.body.voucher);

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID invilido" });
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: "voucher deve ser um valor positivo" });

    const customer = await Customer.findById(id);
    if (!customer) return res.status(404).json({ error: "Cliente nio encontrado" });

    const balanceBefore = customer.voucher;
    customer.voucher += amount;
    await customer.save();

    const transaction = await VoucherTransaction.create({
      customer: customer._id,
      type: 'VENDA',
      amount,
      balanceBefore,
      balanceAfter: customer.voucher,
      clientName: customer.nome,
      clientCpf: customer.cpf,
    });

    await sendEmailSellTemplate(customer, amount);
    return res.status(200).json({ message: "Valor adicionado com sucesso!", cliente: customer, transaction });
  } catch (error) {
    console.error("Erro ao vender voucher:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};
exports.debitAmount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const amount = Number(req.body.voucher);

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID invilido" });
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: "voucher deve ser um valor positivo" });

    const customer = await Customer.findById(id);
    if (!customer) return res.status(404).json({ error: "Cliente nio encontrado" });
    if (customer.voucher < amount) return res.status(400).json({ error: "Saldo insuficiente" });

    const balanceBefore = customer.voucher;
    customer.voucher -= amount;
    await customer.save();

    const transaction = await VoucherTransaction.create({
      customer: customer._id,
      type: 'DEBITO',
      amount,
      balanceBefore,
      balanceAfter: customer.voucher,
      clientName: customer.nome,
      clientCpf: customer.cpf,
    });

    await sendEmailDebitTemplate(customer, amount);
    return res.status(200).json({ message: "Valor debitado com sucesso!", cliente: customer, transaction });
  } catch (error) {
    console.error("Erro ao debitar voucher:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};
exports.transactions = async (req, res, next) => {
  try {
    const { type, customerId, startDate, endDate } = req.query;
    const filter = {};

    if (type) {
      const normalizedType = String(type).toUpperCase();
      if (!['VENDA', 'DEBITO'].includes(normalizedType)) return res.status(400).json({ error: "Tipo de movimentaiio invilido" });
      filter.type = normalizedType;
    }
    if (customerId) {
      if (!mongoose.Types.ObjectId.isValid(customerId)) return res.status(400).json({ error: "ID de cliente invilido" });
      filter.customer = customerId;
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
      if (Object.values(filter.createdAt).some((date) => Number.isNaN(date.getTime()))) return res.status(400).json({ error: "Data invilida" });
    }

    const requestedLimit = Number(req.query.limit);
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 1000) : 500;
    const transactions = await VoucherTransaction.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    return res.status(200).json({ transactions });
  } catch (error) {
    console.error("Erro ao buscar histirico de vouchers:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

exports.reverseTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reason = String(req.body?.reason || '').trim();

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'ID de movimentacao invalido' });
    if (!reason) return res.status(400).json({ error: 'Informe o motivo do estorno' });
    if (reason.length > 500) return res.status(400).json({ error: 'Motivo do estorno muito longo' });

    const original = await VoucherTransaction.findById(id);
    if (!original) return res.status(404).json({ error: 'Movimentacao nao encontrada' });
    if (!['VENDA', 'DEBITO'].includes(original.type)) return res.status(400).json({ error: 'Somente vendas e debitos podem ser estornados' });
    if (original.status === 'ESTORNADA' || original.reversalTransaction) return res.status(409).json({ error: 'Esta movimentacao ja foi estornada' });

    const deadline = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (original.createdAt < deadline) return res.status(400).json({ error: 'O prazo para estorno e de ate sete dias' });

    const lockedOriginal = await VoucherTransaction.findOneAndUpdate(
      {
        _id: id,
        reversalTransaction: null,
        $or: [{ status: 'ATIVA' }, { status: { $exists: false } }],
      },
      { $set: { status: 'ESTORNADA', reversedAt: new Date() } },
      { new: true }
    );

    if (!lockedOriginal) return res.status(409).json({ error: 'Esta movimentacao ja foi estornada' });

    const customer = await Customer.findById(original.customer);
    if (!customer) {
      await VoucherTransaction.findByIdAndUpdate(id, { $set: { status: 'ATIVA', reversedAt: null } });
      return res.status(404).json({ error: 'Cliente da movimentacao nao encontrado' });
    }

    const balanceBefore = Number(customer.voucher || 0);
    const reversesSale = original.type === 'VENDA';
    if (reversesSale && balanceBefore < original.amount) {
      await VoucherTransaction.findByIdAndUpdate(id, { $set: { status: 'ATIVA', reversedAt: null } });
      return res.status(400).json({ error: 'Saldo atual insuficiente para estornar esta venda' });
    }

    customer.voucher = reversesSale ? balanceBefore - original.amount : balanceBefore + original.amount;
    await customer.save();

    const reversal = await VoucherTransaction.create({
      customer: customer._id,
      type: reversesSale ? 'ESTORNO_VENDA' : 'ESTORNO_DEBITO',
      amount: original.amount,
      balanceBefore,
      balanceAfter: customer.voucher,
      clientName: customer.nome,
      clientCpf: customer.cpf,
      reason,
      reversalOf: original._id,
    });

    await VoucherTransaction.findByIdAndUpdate(id, { $set: { reversalTransaction: reversal._id } });

    return res.status(200).json({
      message: 'Estorno realizado com sucesso',
      cliente: customer,
      transaction: reversal,
      originalTransactionId: original._id,
    });
  } catch (error) {
    console.error('Erro ao estornar movimentacao:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "alvesfelixrestaurante@gmail.com",
        pass: "ivbu hkkk kdss rwqy"
    }
});

async function sendEmailDebitTemplate(client, voucher) {
    console.log('client data for email ### ', client)
    console.log('voucher data for email ### ', voucher)

    const assunto = "Debito efetuado em seu vaucher";
    const html = `
        <h2>OlA ${client.nome}</h2>

        <p>Seu voucher foi utilizado em Restaurante da Regina.</p>
        <p>Valor total utilizado: ${voucher}.</p>
        <p>Atenciosamente.</p>
    `;
    const destination = client.email;

    await sendEmail(destination, voucher, assunto, html);
}

async function sendEmailSellTemplate(client, voucher) {
    console.log('client data for email ### ', client)
    console.log('voucher data for email ### ', voucher)

    const assunto = "Voucher gerado com sucesso";
    const html = `
        <h2>Olá ${client.nome}</h2>

        <p>Seu voucher com valor de ${voucher} reais foi gerado com sucesso.</p>
        <p>Atenciosamente.</p>
    `;
    const destination = client.email;
    await sendEmail(destination, voucher, assunto, html);
}

async function sendEmail(destination, voucher, assunto, html) {
   console.log('destination ### ', destination)
   console.log('assunto ### ', assunto)
   console.log('voucher ### ', voucher)
   console.log('html ### ', html)
    try {
        const info = await transporter.sendMail({
           from: 'alvesfelixrestaurante@gmail.com',
           to: destination,
           subject: assunto,
           html: html
       });
        console.log("Email sent:", info);
    } catch (err) {
        console.error("Error sending email:");
        console.error(err);
        console.error(err.stack);
    }
}

exports.login = async (req, res, next) => {
  try {
    if (!req.body) {
      return next(new CustomError(400, "Bad request"));
    }
    const { user, password } = req.body;
    if (!user || !password) {
      return next(new CustomError(400, "Bad request"));
    }

    const userObject = await User.findOne({ user }).select("+password role").populate("role");

    console.log('userObject ', userObject)

    if (!userObject) {
      return next(new CustomError(401, "Auth error"));
    }
    const isValid = await userObject.matchPassword(password);

    if (!isValid) {
      return next(new CustomError(401, "Wrong credentials"));
    }

    return tokenResponse(res, {
      success: true,
      message: "Token response",
      user: userObject
    });
  } catch (err) {
    return next(err);
  }
};

exports.verify = async (req, res, next) => {
    try {
        const { token } = req.body;
        var decoded = jwt.verify(token, "football_jwt_s3cr3t");

        console.log('verify result decoded = ', decoded)

        if (!decoded) {
          return next(new CustomError(400, "Bad request"));
        }
        res
        .status(200)
        .json({ success: true, message: 'Token verified'});
    } catch (err) {
      return next(err);
    }
}


const matchPassword = async function(password, userpassword) {
  return await bcrypt.compare(password, userpassword);
};
