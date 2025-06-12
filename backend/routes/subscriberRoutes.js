const express = require("express");
const { protect, authorize } = require("../middlewares/auth");
const {
  createSubscriber,
  getSubscribers,
  createBulkSubscribers,
} = require("../controllers/subscriberCtrl");

const router = express.Router();

router.use(protect);

router.get("/", getSubscribers);
// router.get("/:id", getSubscriberById);

router.post(
  "/",
  authorize("Admin", "General Manager", "Manager", "Finance"),
  createSubscriber
);

router.post(
  "/bulk",
  authorize("Admin", "General Manager", "Manager", "Finance"),
  createBulkSubscribers
);

module.exports = router;
