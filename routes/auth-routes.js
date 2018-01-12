const router = require('express').Router();
const passport = require('passport');
const User = require('../models/user-model');
const bcrypt = require('bcryptjs');

// auth login
router.get('/login', (req, res) => {

    res.render('auth/login', {
        user: req.user,
        errors: "",
        message: req.flash()
    });
});

//Login POST function
router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        console.log("AND THE USER IS..." + user);
        //      console.log("INFO DOT MESSAGE " + info.message);
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.render('auth/login', {
                user: req.user,
                errors: "",
                message: info.message
            });
        }

        if (user) {
            console.log("I've gotten here!");



            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                return res.redirect('/profile');
            });
        }





    })(req, res, next);
});

// auth logout
router.get('/logout', (req, res) => {
    // handle with passport
    req.logout();
    res.redirect('/');
});

//register page
router.get('/register', (req, res) => {
    res.render('auth/register', {
        user: req.user,
        errors: "",
        message: ""
    });
});

//postback for register
router.post('/register', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    //Validation
    req.checkBody('username', 'Name is required!').notEmpty();
    req.checkBody('password', 'Password is required!').notEmpty();
    req.checkBody('password2', 'Passwords do not match!').equals(req.body.password);

    var errors = req.validationErrors();
    console.log(errors);

    if (errors) {
        res.render('auth/register', {
            errors: errors,
            user: req.user
        })
    } else {

        User.findOne({
            username: username
        }, function (err, user) {
            console.log("Ive gotten this far 2!");
            if (err) {
                console.log("ERROR " + err);
                throw err;
            }
            if (!user) {

                var newUser = new User({
                    username: username,
                    local_password: password,
                    passwords: []

                });


                User.createUser(newUser, function (err, user) {
                    if (err) throw err;
                    console.log('created new local user: ', user);



                    console.log('created new local user: ', newUser);
                    res.render('auth/login', {
                        username: newUser.username,
                        message: `An account for ${newUser.username} has been created. You can now login and access the Locksmith app!`,
                        user: req.user
                    });
                });
            } else {
                console.log("User already exists!");
                res.render('auth/register', {
                        username: username,
                        message: `An account for ${username} already exists. Please choose a different username!`,
                        user: req.user,
                        errors: ""
                    });
            }
        });
    }
});


// auth with google+
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));

// auth with facebook
router.get('/facebook', passport.authenticate('facebook'));

// auth with facebook
router.get('/facebook', passport.authenticate('facebook'));

// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    // res.send(req.user);
    res.redirect('/profile');
});

// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get('/facebook/redirect', passport.authenticate('facebook'), (req, res) => {
    // res.send(req.user);
    res.redirect('/profile');
});

module.exports = router;
