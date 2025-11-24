const express = require('express');
const router = express.Router();

// This route was retired and kept as a harmless placeholder to avoid import errors.
router.all('/', (req, res) => {
  res.status(410).json({ error: 'Removed' });
});

module.exports = router;
