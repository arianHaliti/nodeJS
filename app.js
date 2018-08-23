const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");
const config = require("./config/database");
const passport = require("passport");

// Connect to db
mongoose.connect(config.database);
let db = mongoose.connection;

// Check for db errors
db.on("error", err => {
  console.log(err);
});

db.once("open", () => {
  console.log("connected to mongodb");
});

// Init App
const app = express();

// Bring  Models
let Article = require("./models/articles");

// Load View Engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Body parser middlewear
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Parse applicatiion/json
app.use(bodyParser.json());

// Set public folder
app.use(express.static(path.join(__dirname, "public")));

// Express Session Middlewear
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
  })
);

// Express Messages Middlewear
app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Express VAlidator middlewear
app.use(
  expressValidator({
    errorFomatter: (param, msg, value) => {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

// Passport Config
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get("*", (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Home Route
app.get("/", (req, res) => {
  Article.find({}, (err, articles) => {
    if (err) throw err;
    res.render("index", {
      title: "Read Articles",
      articles
    });
  });
});

// Rout files
let articles = require("./routes/articles");
app.use("/articles", articles);

let users = require("./routes/users");
app.use("/users", users);

//let users = require("./routes/users");
//app.use("/users", users);

// Start Server
app.listen(3000, () => {
  console.log("server started at port 3000 !");
});
