const express = require("express");
const router = express.Router();

let Article = require("../models/articles");
let User = require("../models/user");

router.post("/add", (req, res) => {
  req.checkBody("title", "Title is required").notEmpty();
  // req.checkBody("author", "Author is required").notEmpty();
  req.checkBody("body", "Body is required").notEmpty();

  // Get Errors

  let errors = req.validationErrors();

  if (errors) {
    res.render("add_article", {
      errors
    });
  } else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;
    article.save(err => {
      if (err) {
        console.log(err);
        return;
      } else {
        req.flash("success", "Article Added");
        res.redirect("/");
      }
    });
  }
});

// Add Route

router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("add_article", {
    title: "Add Article"
  });
});

// Get Single Article

router.get("/:id", (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    User.findById(article.author, (err, user) => {
      res.render("article", {
        article,
        author: user.name
      });
    });
  });
});

// Load Edit Form

router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      req.flash("danger", "Not Authorized");
      res.redirect("/");
    } else {
      res.render("article_edit", {
        article
      });
    }
  });
});

router.post("/edit/:id", (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (article) {
      article.title = req.body.title;
      article.author = req.body.author;
      article.body = req.body.body;
      article.save();
      req.flash("success", "Article Updated");
      res.render("article", {
        article
      });
    }
  });
});

router.delete("/:id", (req, res) => {
  if (!req.user) {
    res.status(500).send();
    return;
  }
  let query = { _id: req.params.id };
  Article.findById(req.params.id, (err, article) => {
    if (err) throw err;
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.remove(query, err => {
        if (err) throw err;
        res.send("Success");
      });
    }
  });
});

// Access Controll
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("danger", "Please Login");
    res.redirect("/users/login");
  }
}

module.exports = router;
