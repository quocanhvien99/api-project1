const router = require("express").Router();
const passport = require("passport");
const CLIENT_HOME_PAGE_URL = "http://localhost:3000";

// When logout, redirect to client
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(CLIENT_HOME_PAGE_URL);
});

// auth with google
router.get("/google", passport.authenticate("google", {
    scope: ['profile', 'email']
}));

// redirect to home page after successfully login via google
router.get("/google/redirect",
  passport.authenticate("google", {
    successRedirect: 'http://localhost:3001'
}));

router.get("/facebook", passport.authenticate("facebook"));

router.get("/facebook/redirect",
  passport.authenticate("facebook", {
    successRedirect: 'http://localhost:3001'
}));

router.post('/login', 
  passport.authenticate('local', {
    successRedirect: CLIENT_HOME_PAGE_URL
}));

module.exports = router;