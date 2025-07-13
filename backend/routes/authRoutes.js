const express = require("express");
const { login, changePassword } = require("../controllers/authCtrl");
const { protect } = require("../middlewares/auth");

const router = express.Router();

router.post("/login", login);
router.use(protect).patch("/change-password/:id", changePassword);

module.exports = router;
