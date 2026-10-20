const router = require("express").Router();
const {
  login,
  verify,
  customers,
  saveCustomers,
  customerById,
  customerDeleted,
  customerUpdate,
  sellAmount,
  debitAmount,
  transactions,
  reverseTransaction
} = require("../controller/authentication");

router.get("/customers", customers)
router.get("/customer/:id", customerById)
router.get("/transactions", transactions)
router.post("/transactions/:id/reversal", reverseTransaction)
router.post("/customers", saveCustomers)
router.post("/amount/:id", sellAmount);
router.post("/debit/:id", debitAmount);
router.post("/login", login);
router.post("/verify", verify);
router.delete("/customer/:id", customerDeleted);
router.put("/customer/:id", customerUpdate)

module.exports = router;
