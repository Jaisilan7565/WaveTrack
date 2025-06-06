const Employee = require("../models/Employee");
const AuditLog = require("../models/AuditLog");
const User = require("../models/User");
const { sendApprovalEmail } = require("./emailService");

// Roles that can approve employee actions
const APPROVER_ROLES = ["admin", "general_manager", "senior_hr", "manager"];

/**
 * Check if user can approve/reject requests
 */
exports.canApprove = (userRole) => {
  return APPROVER_ROLES.includes(userRole);
};

/**
 * Get approvers for an employee action
 */
exports.getApprovers = async () => {
  return await User.find({
    role: { $in: APPROVER_ROLES },
    isActive: true,
  }).select("name email role");
};

/**
 * Notify approvers about pending request
 */
exports.notifyApprovers = async (employeeId, action, requesterId) => {
  try {
    const approvers = await this.getApprovers();
    const requester = await User.findById(requesterId);
    const employee = await Employee.findById(employeeId);

    if (!approvers.length) {
      console.warn("No approvers found in the system");
      return;
    }

    const emails = approvers.map((approver) => approver.email);
    const subject = `Pending Approval: Employee ${action}`;
    const text = `
      A new employee ${action} request requires your approval.
      
      Details:
      - Employee: ${employee.name}
      - Email: ${employee.email}
      - Requested by: ${requester.name} (${requester.role})
      
      Please review and take appropriate action.
    `;

    await sendApprovalEmail(emails, subject, text);
  } catch (error) {
    console.error("Error notifying approvers:", error);
  }
};

/**
 * Log approval workflow action
 */
exports.logApprovalAction = async (
  employeeId,
  action,
  performedBy,
  status,
  comments = ""
) => {
  await AuditLog.create({
    action,
    entity: "employee",
    entityId: employeeId,
    performedBy,
    status,
    comments,
  });
};
