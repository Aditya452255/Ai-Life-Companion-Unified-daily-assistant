const express = require("express");
const router = express.Router();

// Mood → Music Recommendation (Mock)
router.post("/", (req, res) => {
  const { mood } = req.body;

  if (!mood) {
    return res.status(400).json({ message: "Mood required" });
  }

  const musicSuggestions = {
    happy: ["Happy – Pharrell", "Blinding Lights – The Weeknd"],
    sad: ["Fix You – Coldplay", "Love Me Before You Go – Lewis Capaldi"],
    calm: ["Weightless – Marconi Union", "Ocean Eyes – Billie Eilish"]
  };

  return res.json({
    songs: musicSuggestions[mood] || ["No match found"]
  });
});

module.exports = router;
