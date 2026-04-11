const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const Employee = require("./models/Employee");

// Load env vars
dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected for seeding...");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@udhithwavetrack.com";
    const adminPassword = process.env.DEFAULT_PASSWORD || "Udhith@1234";

    // Check if admin already exists
    const existingAdmin = await Employee.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin user already exists.");
      process.exit();
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create admin user
    const admin = new Employee({
      employee_id: "EMP-00001",
      name: "System Admin",
      email: adminEmail,
      contact: "0000000000",
      password: hashedPassword,
      roles: ["Admin"],
      status: "Active",
      request_status: "approved",
      joining_date: new Date(),
    });

    // Set created_by to self
    admin.created_by = admin._id;

    await admin.save();

    console.log("Admin user seeded successfully!");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);

    process.exit();
  } catch (err) {
    console.error("Error seeding admin:", err.message);
    process.exit(1);
  }
};

seedAdmin();
