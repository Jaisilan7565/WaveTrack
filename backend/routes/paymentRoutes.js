const express = require("express");
const { protect, authorize } = require("../middlewares/auth");
const {
  createPayment,
  getPayments,
  getPaymentsBySubscriberId,
  approvePayment,
  rejectPayment,
} = require("../controllers/paymentCtrl");

const router = express.Router();

router.use(protect);

router.get("/", getPayments);

router.get("/:subId", getPaymentsBySubscriberId);

router.post(
  "/",
  authorize("Admin", "General Manager", "Manager", "Finance"),
  createPayment
);

router.patch(
  "/:id/approve",
  authorize("Admin", "General Manager", "Manager"),
  approvePayment
);

router.patch(
  "/:id/reject",
  authorize("Admin", "General Manager", "Manager"),
  rejectPayment
);

// router.patch(
//   "/:id",
//   authorize("Admin", "General Manager", "Senior HR", "HR", "Manager"),
//   updateEmployee
// );

// router.patch(
//   "/:id/inActivate",
//   authorize("Admin", "General Manager", "Senior HR", "HR", "Manager"),
//   inActivateEmployee
// );

// router.patch(
//   "/:id/resetPassword",
//   authorize("Admin", "General Manager", "Senior HR", "Manager"),
//   resetPassword
// );

// router.delete("/:id", authorize("Admin", "General Manager"), deleteEmployee);

module.exports = router;
