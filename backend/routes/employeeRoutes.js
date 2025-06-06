const express = require("express");
const {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  approveEmployee,
  rejectEmployee,
  getPendingApprovals,
  getEmployeeById,
  inActivateEmployee,
  resetPassword,
} = require("../controllers/employeeCtrl");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.use(protect);

// Routes for admins, managers, and HRs
router.post(
  "/",
  authorize("Admin", "General Manager", "Senior HR", "HR", "Manager"),
  createEmployee
);

router.get("/", getEmployees);
router.get("/:id", getEmployeeById);

router.patch(
  "/:id",
  authorize("Admin", "General Manager", "Senior HR", "HR", "Manager"),
  updateEmployee
);

router.patch(
  "/:id/approve",
  authorize("Admin", "General Manager", "Senior HR", "Manager"),
  approveEmployee
);

router.patch(
  "/:id/reject",
  authorize("Admin", "General Manager", "Senior HR", "Manager"),
  rejectEmployee
);

router.patch(
  "/:id/inActivate",
  authorize("Admin", "General Manager", "Senior HR", "HR", "Manager"),
  inActivateEmployee
);

router.patch(
  "/:id/resetPassword",
  authorize("Admin", "General Manager", "Senior HR", "Manager"),
  resetPassword
);

router.delete("/:id", authorize("Admin", "General Manager"), deleteEmployee);

// // Approval routes
// router.put(
//   "/:id/approve",
//   authorize("admin", "general_manager", "senior_hr", "manager"),
//   approveEmployee
// );

// router.put(
//   "/:id/reject",
//   authorize("admin", "general_manager", "senior_hr", "manager"),
//   rejectEmployee
// );

// router.get(
//   "/pending/approvals",
//   authorize("admin", "general_manager", "senior_hr", "manager"),
//   getPendingApprovals
// );

module.exports = router;
