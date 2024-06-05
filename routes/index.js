const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", { user: req.session.user });
});

router.get("/game", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/users/login");
  }
  res.render("index", { user: req.session.user });
});

router.get("/rules", (req, res) => {
  res.render("rules");
});

module.exports = router;
