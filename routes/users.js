const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
// Bring in User model
let User = require("../models/user");

// Register Form
router.get("/register", (req, res) => {
  res.render("register");
});

// Register Process

router.post("/register", (req, res) => {
  let name = req.body.name;
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let password2 = req.body.password2;

  req.checkBody("name", "Name is required").notEmpty();
  req.checkBody("email", "Email is required").notEmpty();
  req.checkBody("username", "Username is required").notEmpty();
  req.checkBody("password", "Password is required").notEmpty();
  req.checkBody("password2", "Passwords do not match").equals(password);

  let errors = req.validationErrors();
  if (errors) {
    res.render("register", {
      errors
    });
  } else {
    let newUser = new User({
      name,
      email,
      username,
      password
    });
    bcrypt.genSalt(10, (err, salt) => {
      console.log(111);
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser.save(err => {
          if (err) {
            console.log(err);
          } else {
            req.flash("success", "You are now Registered");
            res.redirect("/users/login");
          }
        });
      });
    });
  }
});

// Login Form
router.get("/login", (req, res) => {
  res.render("login");
});

//Login Process
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "You are logged out");
  res.redirect("/users/login");
});

module.exports = router;
