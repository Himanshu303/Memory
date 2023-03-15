const express = require("express");
const router = express.Router();
const { ensureAuth, ensureGuest } = require("../middleware/auth");
const Story = require("../models/Story");
const { formatDate } = require("../helpers/ejs");

//@desc Login/Landing Page
//@route GET /
router.get("/", ensureGuest, (req, res) => {
  res.render("login", {
    layout: "layouts/loginlayout",
  });
});

//@desc Dashboard
//@route GET /dashboard
router.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.user.id });
    res.render("dashboard", {
      layout: "layouts/boilerplate",
      name: req.user.firstName,
      stories,
      formatDate,
    });
  } catch (err) {
    console.log(err);
    res.render("error", { err, layout: "layouts/boilerplate" });
  }
});

module.exports = router;
