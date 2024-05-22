const express = require("express");
const router = express.Router();

// Home route
router.get("/", (req, res) => {
  res.render("index", { user: req.session.user });
});

// Game route (protected)
router.get("/game", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/users/login");
  }
  res.render("index", { user: req.session.user });
});

module.exports = router;
