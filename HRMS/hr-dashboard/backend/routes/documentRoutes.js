const express = require("express");
const router = express.Router();

const documentController = require("../controllers/documentController");
const { protect } = require("../middleware/authMiddleware");
const restrictTo = require("../middleware/roleMiddleware");

router.get("/my", protect, documentController.getMyDocuments);
router.get(
  "/user/:id",
  protect,
  restrictTo("Manager", "HR", "Admin"),
  documentController.getDocumentsByUser
);

module.exports = router;
