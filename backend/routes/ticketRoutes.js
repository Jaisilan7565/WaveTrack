const express = require("express");
const { protect, authorize } = require("../middlewares/auth");
const { createTicket } = require("../controllers/ticketCtrl");

const router = express.Router();

router.use(protect);

// router.get("/", getTickets);

router.post(
  "/",
  authorize("Admin", "General Manager", "Manager", "Finance"),
  createTicket
);

module.exports = router;
