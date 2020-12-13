const passport = require("passport");
const User = require("./models/User");
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local');
const shortid = require('shortid');
const bcrypt = require('bcrypt');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/redirect`
  },
  async (accessToken, refreshToken, profile, done) => {
    const emailExist = await User.findOne({ email: profile.emails[0].value });
    if (emailExist) {
        done(null, emailExist)
    } else {
        const user = new User({
            name: profile.displayName,
            email: profile.emails[0].value
        });
        const savedUser = await user.save();
		done(null, savedUser);
    }
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/facebook/redirect`,
    profileFields: ['email', 'displayName']
  },
  async(accessToken, refreshToken, profile, done) => {
      if (profile.emails) {
        const emailExist = await User.findOne({ email: profile.emails[0].value });
        if (emailExist) {
            done(null, emailExist)
        } else {
            const user = new User({
                name: profile.displayName,
                email: profile.emails[0].value
            });
            const savedUser = await user.save();
            done(null, savedUser);
        }
      } else {
        const fbExist = await User.findOne({ fbid: profile.id });
        if (fbExist) {
            done(null, fbExist)
        } else {
            const user = new User({
                name: profile.displayName,
                fbid: profile.id
            });
            const savedUser = await user.save();
            done(null, savedUser);
        }
      }
    
  }
));

passport.use(new LocalStrategy({usernameField: 'email'},
    async (email, password, done) => {
        const user = await User.findOne({ email });
        if (!user) return done(null, false);
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return done(null, false);
        done(null, user);
    }
));