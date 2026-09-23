const Document = require("../models/Document");

exports.getMyDocuments = async (req, res) => {
  try {
    const records = await Document.find({ user: req.user.id }).sort({ uploadedAt: -1 });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch documents" });
  }
};

exports.getDocumentsByUser = async (req, res) => {
  try {
    const records = await Document.find({ user: req.params.id }).sort({ uploadedAt: -1 });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch documents" });
  }
};
