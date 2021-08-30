const express = require("express");
const jokesController = require("../controllers/jokesController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", jokesController.jokes_index);

router.get("/all", jokesController.jokes_index_all);

router.post("/", requireAuth, jokesController.jokes_create);

router.get("/:index", jokesController.jokes_index_index);

router.delete("/:id", requireAuth, jokesController.jokes_delete);

module.exports = router;