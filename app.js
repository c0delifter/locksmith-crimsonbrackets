const express = require('express');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const passport = require('passport');
const passportSetup = require('./config/passport-setup');
const mongoose = require('mongoose');
const keys = require("./config/keys");
const cookieSession = require('cookie-session');
var expressValidator = require('express-validator');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');

//creates our application
const app = express();

//set up view engine
app.set('view engine', 'ejs');
//Set static folder
app.use(express.static(path.join(__dirname, 'public')));


//use flash messages
app.use(flash());

app.use(cookieSession({
    maxAge: 24*60*60*1000,
    keys: [keys.session.cookieKey]
}));

//Express Validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;
        
        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));


//Global vars for flash messages
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});


//body parser to get info from form posts
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Use express layouts
app.use(expressLayouts);
app.set('layout', 'layout/layout');

//initialize passport
app.use(passport.initialize());
app.use(passport.session());

//connect to MongoDB
mongoose.connect(keys.mongodb.dbURI, function() {
    console.log('Connected to MongoDB');
});

//set up routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

//create home route
app.get('/', function(req, res) {
    res.render('home', {
        user: req.user
    });
});

const port = process.env.PORT || 8080;

app.listen(port, function() {
    console.log(`app now listening to requests on port ${port}`);
});