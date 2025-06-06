const express = require("express");
const {
  login,
  getMe,
  updateDetails,
  updatePassword,
} = require("../controllers/authCtrl");
const { protect } = require("../middlewares/auth");

const router = express.Router();

router.post("/login", login);
// router.get("/me", protect, getMe);
// router.put("/updatedetails", protect, updateDetails);
// router.put("/updatepassword", protect, updatePassword);

module.exports = router;
