const express = require("express");
const indexController = require("../controllers/indexController");
const { requireAuth, requireNoAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", indexController.index_get);

router.get("/login", requireNoAuth, indexController.login_get);
  
router.get("/register", requireNoAuth, indexController.register_get);

router.post("/register", requireNoAuth, indexController.register_post);

router.post("/login", requireNoAuth, indexController.login_post)

router.get("/logout", requireAuth, indexController.logout_get);

module.exports = router;