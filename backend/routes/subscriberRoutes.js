const express = require("express");
const { protect, authorize } = require("../middlewares/auth");
const {
  createSubscriber,
  getSubscribers,
  createBulkSubscribers,
  rejectSubscriber,
  approveSubscriber,
  bulkApproveSubscribers,
  bulkDeleteSubscribers,
  getSubscriberById,
} = require("../controllers/subscriberCtrl");

const router = express.Router();

router.use(protect);

router.get("/", getSubscribers);
router.get("/:id", getSubscriberById);

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

router.patch(
  "/:id/approve",
  authorize("Admin", "General Manager", "Manager"),
  approveSubscriber
);

router.patch(
  "/:id/reject",
  authorize("Admin", "General Manager", "Manager"),
  rejectSubscriber
);

router.patch(
  "/bulk-approve",
  authorize("Admin", "General Manager", "Manager"),
  bulkApproveSubscribers
);

router.patch(
  "/bulk-reject",
  authorize("Admin", "General Manager", "Manager"),
  bulkApproveSubscribers
);

router.patch(
  "/bulk-delete",
  authorize("Admin", "General Manager"),
  bulkDeleteSubscribers
);

module.exports = router;
