const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ message: "Question is required" });
  }

  // Simple bot demo response
  return res.json({
    answer: "AI Assistant response for: " + question
  });
});

module.exports = router;
