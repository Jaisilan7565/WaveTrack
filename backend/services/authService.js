const User = require("../models/User");
const { hashPassword, generateToken } = require("../utils/helpers");
const { sendPasswordResetEmail } = require("../utils/emailService");
const config = require("../config/config");

class AuthService {
  /**
   * Authenticate user
   */
  async login(email, password) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error("Account is not active");
    }

    // Generate token
    const token = generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Change user password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new Error("User not found");
    }

    // Check current password
    if (!(await user.matchPassword(currentPassword))) {
      throw new Error("Current password is incorrect");
    }

    // Update password
    user.password = await hashPassword(newPassword);
    await user.save();

    return true;
  }

  /**
   * Initiate password reset
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = generateToken(user._id, "1h");

    // Send email
    await sendPasswordResetEmail(email, resetToken);

    return true;
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret);

      // Find user and update password
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new Error("User not found");
      }

      user.password = await hashPassword(newPassword);
      await user.save();

      return true;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
}

module.exports = new AuthService();
