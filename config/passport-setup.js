const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const keys = require('./keys');
const User = require('../models/user-model');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy({
        // options for google strategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/auth/google/redirect'
    }, (accessToken, refreshToken, profile, done) => {
        // check if user already exists in our own db
        User.findOne({
            googleId: profile.id
        }).then((currentUser) => {
            if (currentUser) {
                // already have this user
                console.log('Google user found: ', currentUser);
                done(null, currentUser);
            } else {
                // if not, create user in our db
                new User({
                    googleId: profile.id,
                    username: profile.displayName,
                    passwords: []

                }).save().then((newUser) => {
                    console.log('created new Google user: ', newUser);
                    done(null, newUser);
                });
            }
        });
    })
);

passport.use(new FacebookStrategy({
        //options for Facebook strategy
        clientID: keys.facebook.clientID,
        clientSecret: keys.facebook.clientSecret,
        callbackURL: '/auth/facebook/redirect'
    },
    function (accessToken, refreshToken, profile, done) {
        User.findOne({
            facebookId: profile.id
        }).then((currentUser) => {
            if (currentUser) {
                // already have this user
                console.log('FB user found: ', currentUser);
                done(null, currentUser);
            } else {
                // if not, create user in our db
                new User({
                    facebookId: profile.id,
                    username: profile.displayName,
                    passwords: []

                }).save().then((newUser) => {
                    console.log('created new FB user: ', newUser);
                    done(null, newUser);
                });
            }
        });
    }
));

passport.use(new LocalStrategy({
        username: 'username',
        password: 'password',
        passReqToCallback: true

    },
    function (req, username, password, done) {
        console.log("Ive gotten this far!");
    
        console.log("USERNAME " + username);
        console.log("PASSWORD " + password);

        User.findOne({
            username: username
        }, function (err, user) {
            console.log("Ive gotten this far 2!");
            if (err) {
                console.log("ERROR " + err);
                throw err;
            }
            if (!user) {
                console.log("NOT USER");
                return done(null, false, {
                    message: 'Incorrect username!'
                });
            }

            
            User.comparePassword(password, user.local_password, function(err, isMatch) {
                console.log("The compare function is working!");
            if (err) throw err;
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, {message: 'Invalid password'});
            }
            });
            console.log("Username " + user);
            return done(null, user);
        });
    }
));
