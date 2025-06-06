const Employee = require("../models/Employee");
const User = require("../models/User");
const { hashPassword } = require("../utils/helpers");
const { notifyApprovers } = require("../utils/approvalWorkflow");
const config = require("../config/config");

class EmployeeService {
  /**
   * Create a new employee with pending status
   */
  async createEmployee(employeeData, createdBy) {
    // Check if email already exists
    const existingUser = await User.findOne({ email: employeeData.email });
    if (existingUser) {
      throw new Error("Email already exists");
    }

    // Create user with default password
    const hashedPassword = await hashPassword(config.defaults.password);
    const user = await User.create({
      name: employeeData.name,
      email: employeeData.email,
      password: hashedPassword,
      role: employeeData.roles[0], // Primary role
      isActive: false, // Inactive until approved
    });

    // Create employee record
    const employee = await Employee.create({
      user_id: user._id,
      ...employeeData,
      created_by: createdBy,
      status: "pending",
    });

    // Notify approvers
    await notifyApprovers(employee._id, "creation", createdBy);

    return employee;
  }

  /**
   * Update employee details and set status to pending
   */
  async updateEmployee(employeeId, updateData, modifiedBy) {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    // Update employee (status goes back to pending)
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      {
        ...updateData,
        modified_by: modifiedBy,
        status: "pending",
      },
      { new: true, runValidators: true }
    );

    // Update corresponding user if email or name changed
    if (updateData.email || updateData.name) {
      await User.findByIdAndUpdate(employee.user_id, {
        name: updateData.name || employee.name,
        email: updateData.email || employee.email,
        role: updateData.roles?.[0] || employee.roles[0],
      });
    }

    // Notify approvers
    await notifyApprovers(employee._id, "update", modifiedBy);

    return updatedEmployee;
  }

  /**
   * Soft delete employee
   */
  async deleteEmployee(employeeId, deletedBy) {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    // Soft delete
    employee.isActive = false;
    await employee.save();

    // Deactivate user
    await User.findByIdAndUpdate(employee.user_id, { isActive: false });

    // Notify approvers
    await notifyApprovers(employee._id, "deletion", deletedBy);

    return employee;
  }

  /**
   * Approve employee action
   */
  async approveEmployee(employeeId, approvedBy) {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    // Update status to approved
    employee.status = "approved";
    await employee.save();

    // Activate user
    await User.findByIdAndUpdate(employee.user_id, { isActive: true });

    return employee;
  }

  /**
   * Reject employee action
   */
  async rejectEmployee(employeeId, rejectedBy, comments = "") {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    // Update status to rejected
    employee.status = "rejected";
    await employee.save();

    return employee;
  }

  /**
   * Get employees with filters
   */
  async getEmployees(filters = {}) {
    let query = { isActive: true };

    if (filters.status) query.status = filters.status;
    if (filters.role) query.roles = { $in: [filters.role] };

    return await Employee.find(query)
      .populate("created_by", "name email role")
      .populate("modified_by", "name email role");
  }
}

module.exports = new EmployeeService();
