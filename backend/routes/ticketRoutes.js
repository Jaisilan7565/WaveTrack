const express = require("express");
const { protect, authorize } = require("../middlewares/auth");
const {
  createTicket,
  getTickets,
  approveTicket,
  rejectTicket,
  getTicketById,
} = require("../controllers/ticketCtrl");

const router = express.Router();

router.use(protect);

router.get("/", getTickets);
router.get("/:id", getTicketById);

router.post(
  "/",
  authorize("Admin", "General Manager", "Manager", "Team Lead"),
  createTicket
);

router.patch(
  "/:id/approve",
  authorize("Admin", "General Manager", "Manager", "Team Lead"),
  approveTicket
);

router.patch(
  "/:id/reject",
  authorize("Admin", "General Manager", "Manager", "Team Lead"),
  rejectTicket
);

module.exports = router;
