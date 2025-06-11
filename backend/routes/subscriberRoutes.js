const express = require("express");
const { protect, authorize } = require("../middlewares/auth");
const { createSubscriber } = require("../controllers/subscriberCtrl");

const router = express.Router();

router.use(protect);

// router.get("/", getSubscribers);
// router.get("/:id", getSubscriberById);

router.post(
  "/",
  authorize("Admin", "General Manager", "Manager", "Finance"),
  createSubscriber
);

module.exports = router;
