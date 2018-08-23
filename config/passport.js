const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");
const config = require("../config/database");
const bcrypt = require("bcryptjs");

module.exports = passport => {
  console.log(33);
  // Local Strategy
  passport.use(
    new LocalStrategy((username, password, done) => {
      //Match usernme
      let query = { username: username };
      console.log(1);
      User.findOne(query, (err, user) => {
        if (err) throw err;
        if (!user) {
          console.log("not found");
          return done(null, false, { message: "No user found" });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;

          if (isMatch) {
            return done(null, user);
          } else {
            console.log("Cred no mtch");
            return done(null, false, { message: " Credenctials do not match" });
          }
        });
      });
    })
  );
  //dasdas
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
