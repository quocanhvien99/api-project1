const router = require("express").Router();
const passport = require("passport");
const CLIENT_HOME_PAGE_URL = "http://localhost:3000";

// When logout, redirect to client
router.get("/logout", (req, res) => {
  req.logout();
  //res.redirect(CLIENT_HOME_PAGE_URL);
  res.redirect(process.env.FRONTEND_URL);
});

// auth with google
router.get("/google", passport.authenticate("google", {
    scope: ['profile', 'email']
}));

// redirect to home page after successfully login via google
router.get("/google/redirect",
  passport.authenticate("google", {
    successRedirect: process.env.FRONTEND_URL
}));

router.get("/facebook", passport.authenticate("facebook"));

router.get("/facebook/redirect",
  passport.authenticate("facebook", {
    successRedirect: process.env.FRONTEND_URL
}));

router.post('/login', 
  passport.authenticate('local', {
    //successRedirect: CLIENT_HOME_PAGE_URL
    successRedirect: process.env.FRONTEND_URL
}));

module.exports = router;