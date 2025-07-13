const Employee = require("../models/Employee");
// const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const ErrorResponse = require("../utils/errorResponse");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const authCtrl = {
  // Login employee
  login: asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(
        new ErrorResponse("Please provide an email and password", 400)
      );
    }

    try {
      // Check for user
      const employee = await Employee.findOne({ email }).select("+password");

      if (!employee) {
        return next(new ErrorResponse("Invalid credentials", 401));
      }

      // Check if user is Active and Approved
      if (
        employee.isDeleted ||
        employee.status !== "Active" ||
        employee.request_status !== "approved"
      ) {
        return next(
          new ErrorResponse("Account is not Active or Approved", 401)
        );
      }

      // Check if password matches
      const isMatch = await bcrypt.compare(password, employee.password);

      if (!isMatch) {
        return next(new ErrorResponse("Invalid credentials", 401));
      }

      // Generate token
      const token = jwt.sign(
        {
          id: employee?._id,
          employee_id: employee?.employee_id,
          name: employee?.name,
          email: employee?.email,
          contact: employee?.contact,
          roles: employee?.roles,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRE,
        }
      );

      res.status(200).json({
        success: true,
        token,
        user: {
          // token,
          _id: employee._id,
          employee_id: employee?.employee_id,
          name: employee?.name,
          email: employee?.email,
          contact: employee?.contact,
          roles: employee?.roles,
        },
      });
    } catch (err) {
      next(err);
    }
  }),

  // Change password
  changePassword: asyncHandler(async (req, res, next) => {
    try {
      const employee = await Employee.findById(req.params.id).select(
        "+password"
      );

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const { currentPassword, newPassword } = req.body;

      // Validate current password
      if (!currentPassword || !newPassword) {
        return next(
          new ErrorResponse("Please provide current and new password", 400)
        );
      }
      // Check if current password matches
      const isMatch = await bcrypt.compare(currentPassword, employee.password);

      if (!isMatch) {
        return next(new ErrorResponse("Current password is incorrect", 401));
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await Employee.findByIdAndUpdate(
        req.params.id,
        {
          password: hashedPassword,
          decision_by: req.user.id,
          updatedAt: Date.now(),
        },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        message: "Password Changed Successfully",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }),
};

module.exports = authCtrl;
