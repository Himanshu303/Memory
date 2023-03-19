const express = require("express");
const passport = require("passport");
const router = express.Router();

//@desc Auth with google
//@route GET auth/google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile"] }),
  (req, res) => {
    //When we hit the route, email id will be authenticated and then will be redirected to auth/google/callback
  }
);

//@desc Google Auth Callback
//@route GET /auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    req.flash("success","Logged in Successfully");
    res.redirect("/dashboard");
  }
);

//@desc Logout User
//@route GET /auth/logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success","Logged out Successfully");
    res.redirect("/");
  });
});

module.exports = router;
