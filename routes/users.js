const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Sign-up route
router.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});

router.post("/signup", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.render("signup", { error: "Passwords do not match" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await User.create({ username, email, password: hashedPassword });
    res.redirect("/users/login");
  } catch (err) {
    res.render("signup", { error: "User already exists" });
  }
});

// Log-in route
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.render("login", { error: "Invalid username or password" });
  }

  // const isMatch = await bcrypt.compare(password, user.password);
  // if (!isMatch) {
  //   console.log(password, user.password);
  //   return res.render("login", { error: "Invalid username or password" });
  // }

  req.session.user = user;
  res.redirect("/");
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/users/login");
});

router.post("/updateScore", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send("Unauthorized");
  }

  const { score } = req.body;
  try {
    const user = await User.findById(req.session.user._id);
    if (score > user.score) {
      user.score = score;
      await user.save();
      req.session.user.score = score;
    }
    res.status(200).send("Score updated successfully");
  } catch (error) {
    res.status(500).send("Error updating score");
  }
});

router.post("/resetScore", (req, res) => {
  if (!req.session.user) {
    return res.status(401).send("Unauthorized");
  }

  req.session.user.score = 0;
  res.status(200).send("Score reset successfully");
});

// Rank route
router.get("/rank", async (req, res) => {
  try {
    const users = await User.find().sort({ score: -1 });
    res.render("rank", { users });
  } catch (err) {
    res.status(500).send("Error retrieving user ranks");
  }
});

module.exports = router;
