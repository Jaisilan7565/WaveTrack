const Employee = require("../models/Employee");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const ErrorResponse = require("../utils/errorResponse");
const bcrypt = require("bcryptjs");

// @desc    Create new employee (goes to approval)
// @route   POST /api/v1/employees
// @access  Private (admin, general_manager, senior_hr, hr, manager)
exports.createEmployee = async (req, res, next) => {
  try {
    const { name, email, contact, roles, remark } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse("Email already exists", 400));
    }

    // Create user with default password
    const defaultPassword = process.env.DEFAULT_PASSWORD;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: roles[0], // Primary role
      isActive: false, // Inactive until approved
    });

    // Create employee record
    const employee = await Employee.create({
      user_id: user._id,
      name,
      email,
      contact,
      roles,
      remark,
      created_by: req.user.id,
      status: "pending",
    });

    // Create audit log
    await AuditLog.create({
      action: "create",
      entity: "employee",
      entityId: employee._id,
      performedBy: req.user.id,
      status: "pending",
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all employees (with filters)
// @route   GET /api/v1/employees
// @access  Private
exports.getEmployees = async (req, res, next) => {
  try {
    const { status, role } = req.query;
    let query = { isActive: true };

    if (status) query.status = status;
    if (role) query.roles = { $in: [role] };

    const employees = await Employee.find(query)
      .populate("created_by", "name email role")
      .populate("modified_by", "name email role");

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single employee
// @route   GET /api/v1/employees/:id
// @access  Private
exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      isActive: true,
    })
      .populate("created_by", "name email role")
      .populate("modified_by", "name email role");

    if (!employee) {
      return next(new ErrorResponse("Employee not found", 404));
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update employee (goes to approval)
// @route   PUT /api/v1/employees/:id
// @access  Private (admin, general_manager, senior_hr, hr, manager)
exports.updateEmployee = async (req, res, next) => {
  try {
    const { name, email, contact, roles, remark } = req.body;

    let employee = await Employee.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!employee) {
      return next(new ErrorResponse("Employee not found", 404));
    }

    // Check if email is being changed and if new email exists
    if (email && email !== employee.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(new ErrorResponse("Email already exists", 400));
      }
    }

    // Save old values for audit log
    const oldValues = {
      name: employee.name,
      email: employee.email,
      contact: employee.contact,
      roles: employee.roles,
      remark: employee.remark,
    };

    // Update employee (status goes back to pending)
    employee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        contact,
        roles,
        remark,
        modified_by: req.user.id,
        status: "pending",
      },
      { new: true, runValidators: true }
    );

    // Update corresponding user if email or name changed
    await User.findByIdAndUpdate(employee.user_id, {
      name,
      email,
      role: roles[0], // Update primary role
    });

    // Create audit log
    await AuditLog.create({
      action: "update",
      entity: "employee",
      entityId: employee._id,
      performedBy: req.user.id,
      changes: {
        old: oldValues,
        new: { name, email, contact, roles, remark },
      },
      status: "pending",
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete employee (soft delete, goes to approval)
// @route   DELETE /api/v1/employees/:id
// @access  Private (admin, general_manager, senior_hr, hr, manager)
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!employee) {
      return next(new ErrorResponse("Employee not found", 404));
    }

    // Soft delete
    await employee.softDelete();

    // Deactivate user
    await User.findByIdAndUpdate(employee.user_id, { isActive: false });

    // Create audit log
    await AuditLog.create({
      action: "delete",
      entity: "employee",
      entityId: employee._id,
      performedBy: req.user.id,
      status: "pending",
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve employee creation/update/deletion
// @route   PUT /api/v1/employees/:id/approve
// @access  Private (admin, general_manager, senior_hr, manager)
exports.approveEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!employee) {
      return next(new ErrorResponse("Employee not found", 404));
    }

    // Check if user has permission to approve
    const approverRoles = ["admin", "general_manager", "senior_hr", "manager"];
    if (!approverRoles.includes(req.user.role)) {
      return next(new ErrorResponse("Not authorized to approve", 403));
    }

    // Update status to approved
    employee.status = "approved";
    await employee.save();

    // Activate user if it was a create or update action
    const latestAudit = await AuditLog.findOne({
      entityId: employee._id,
    }).sort({ createdAt: -1 });

    if (latestAudit.action === "create" || latestAudit.action === "update") {
      await User.findByIdAndUpdate(employee.user_id, { isActive: true });
    }

    // Update audit log
    await AuditLog.findByIdAndUpdate(latestAudit._id, { status: "approved" });

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject employee creation/update/deletion
// @route   PUT /api/v1/employees/:id/reject
// @access  Private (admin, general_manager, senior_hr, manager)
exports.rejectEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!employee) {
      return next(new ErrorResponse("Employee not found", 404));
    }

    // Check if user has permission to reject
    const approverRoles = ["admin", "general_manager", "senior_hr", "manager"];
    if (!approverRoles.includes(req.user.role)) {
      return next(new ErrorResponse("Not authorized to reject", 403));
    }

    // Update status to rejected
    employee.status = "rejected";
    await employee.save();

    // Update audit log
    const latestAudit = await AuditLog.findOne({
      entityId: employee._id,
    }).sort({ createdAt: -1 });

    await AuditLog.findByIdAndUpdate(latestAudit._id, { status: "rejected" });

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get pending approvals
// @route   GET /api/v1/employees/pending
// @access  Private (admin, general_manager, senior_hr, manager)
exports.getPendingApprovals = async (req, res, next) => {
  try {
    const pendingEmployees = await Employee.find({
      status: "pending",
      isActive: true,
    })
      .populate("created_by", "name email role")
      .populate("modified_by", "name email role");

    res.status(200).json({
      success: true,
      count: pendingEmployees.length,
      data: pendingEmployees,
    });
  } catch (err) {
    next(err);
  }
};

// const asyncHandler = require("express-async-handler");
// const bcrypt = require("bcryptjs");
// const Employee = require("../models/Employee");
// const jwt = require("jsonwebtoken");

// const employeeController = {
//   //Get All Employee
//   getEmployees: asyncHandler(async (req, res) => {
//     //find the user
//     // const employees = await Employee.find();
//     // if (!employees) {
//     //   throw new Error("Employees not found");
//     // }
//     // //send the response
//     // res.json({
//     //   employees,
//     // });
//     try {
//       const { status, role } = req.query;
//       let query = { isActive: true };

//       if (status) query.status = status;
//       if (role) query.roles = { $in: [role] };

//       const employees = await Employee.find(query)
//         .populate("created_by", "name email role")
//         .populate("modified_by", "name email role");

//       res.status(200).json({
//         success: true,
//         count: employees.length,
//         data: employees,
//       });
//     } catch (err) {
//       next(err);
//     }
//   }),
// };

// module.exports = employeeController;
