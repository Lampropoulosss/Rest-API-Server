const express = require("express");
const emailController = require("../controllers/emailController.js");
const { requireAuth, requireNoAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.use("/verification/:token", emailController.verification_get);

module.exports = router;