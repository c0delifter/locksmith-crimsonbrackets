const router = require('express').Router();
const User = require('../models/user-model');
const AES = require("crypto-js/aes");
const SHA256 = require("crypto-js/sha256");
const CryptoJS = require("crypto-js");

const authCheck = function (req, res, next) {
    if (!req.user) {
        //if user is not logged in
        res.render('auth/login', {
            message: "Make sure to login before accessing your profile!",
            user: req.user
        });
    } else {
        //if logged in
        next();
    }
};

router.get('/', authCheck, function (req, res) {
    var secret = "7n0XhSdM9f9CiZQwgMJI";

    
    
    var passwordsArray = req.user.passwords;
    
    var decryptedArray = [];
    
    for (var i = 0; i < passwordsArray.length; i++) {
        console.log("ENCRYPTED " + passwordsArray[i].password);
        var bytes = CryptoJS.AES.decrypt(passwordsArray[i].password, secret);
        var decryptPassword = bytes.toString(CryptoJS.enc.Utf8);
        console.log("DECRYPTED " + decryptPassword);
        req.user.passwords[i].password = decryptPassword;
        decryptedArray.push(decryptPassword);
    }
    
    console.log(decryptedArray);
    
    var avgLengthFunc = function () {
            var passwords = decryptedArray;
            var length = 0;
            passwords.forEach(function (item) {
                length += item.length;
            });
        
            console.log(length);

            return Math.round(length / passwords.length);
    }
    
   var avgStrengthFunc = function() {
       var passwords = req.user.passwords;
       var weak = 0;
       var medium = 0;
       var strong = 0;
       passwords.forEach(function(item) {
           console.log("ITEM STRENGTH +" + item.strength);
           if (item.strength === "Weak") {
               weak+=1;
           } 
           
           if (item.strength === "Medium") {
               medium+=1;
           } 
           
           if (item.strength === "Strong"){
               strong+=1;
           }
           
           
       });
       
       
       var finalStrength = Math.max(weak, medium, strong);
           
           console.log("FINAL STRENGTH =" + finalStrength);
           
           if (finalStrength == weak) {
               return "Weak";
           } else if (finalStrength == medium) {
               return "Medium";
           } else {
               return "Strong";
           }
   }
    
    
    res.render('profile/profile', {
        user: req.user,
        avgLength: avgLengthFunc,
        avgStrength: avgStrengthFunc
    });
});

//acess page that lets you add new passwords to collection
router.get('/newpassword', authCheck, function (req, res) {
    res.render('profile/addpassword', {
        user: req.user
    });
});

//create new password
router.post('/newpassword', authCheck, function (req, res) {


    var username = req.user.username;
    var passwordname = req.body.password_name;
    var password = req.body.password;
    console.log(username + " " + passwordname + " " + password);
    
    // Encrypt 
    
    var secret = "7n0XhSdM9f9CiZQwgMJI";
    var cipherPassword = CryptoJS.AES.encrypt(password, secret);
    console.log("ENCRYPTION PASSWORD:" + cipherPassword + typeof(cipherPassword));

    //calculate password strength func
    var passwordStrength = function() {
        //strength meter
        var strength = 0;
        //lower case letters
        var lowerCaseLetters = /[a-z]/g;
        //uppercase letters
        var upperCaseLetters = /[A-Z]/g;
        //numbers
        var numbers = /[0-9]/g;
        
        var specialCharacters = /[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/;
        
        if (password.match(lowerCaseLetters)) {
            strength+=1;
        }
        
        if (password.match(upperCaseLetters)) {
            strength+=1;
        }
        
        if (password.match(numbers)) {
            strength+=1;
        }
        
        if (password.length > 8) {
            strength+=1;
        }
        
        if (password.match(specialCharacters)) {
            console.log("IT DOEEEES!!!!");
            strength+=1;
        }
        
        console.log("STREEEEENGTH" + strength);
        
        if (strength < 3) {
            return "Weak";
        }
        
        if (strength < 5) {
            return "Medium";
        }
        
        if (strength === 5) {
            return "Strong";
        }
        
    }

    var newPassword = {
        name: passwordname,
        password: cipherPassword.toString(),
        strength: passwordStrength()
    };

    User.update({
        username: username
    }, {
        $push: {
            passwords: newPassword
        }
    }).then(function (response) {
        console.log("Time to make a new password!");
        if (response) {
            console.log(response);
            res.redirect('/profile');

        } else {
            console.log("user not found or something");
        }
    });

});

//create new password page
router.get('/newpassword', authCheck, function (req, res) {
    res.render('profile/addpassword', {
        user: req.user
    });
});

//modify password
router.get('/modify/:id', authCheck, function (req, res) {
    var secret = "7n0XhSdM9f9CiZQwgMJI";
    var username = req.user.username;
    var id = req.params.id;
    console.log("I'm working and here's the id " + id);
    var passwordsArray = req.user.passwords;
    
    var decryptedPasswords = [];
    
    for (var i = 0; i < passwordsArray.length; i++) {
        console.log("ENCRYPTED " + passwordsArray[i].password);
        var bytes = CryptoJS.AES.decrypt(passwordsArray[i].password, secret);
        var decryptPassword = bytes.toString(CryptoJS.enc.Utf8);
        console.log("DECRYPTED " + decryptPassword);
        req.user.passwords[i].password = decryptPassword;
        decryptedPasswords.push(req.user.passwords[i]);
    }
    
    
    console.log(decryptedPasswords);

    decryptedPasswords.forEach(findPassport);

    function findPassport(item) {

        if (item._id == id) {
            console.log("Found it!");
            var index = decryptedPasswords.indexOf(item);
            res.render('profile/modify', {
                user: req.user,
                index: index
            });
        }
    }





});

//save modified password

//modify password
router.post('/modify/:id', authCheck, function (req, res) {
    var username = req.user.username;
    var id = req.params.id;
    console.log("I'm working and here's the id " + id);
    var passwords = req.user.passwords;
    console.log(passwords);
    
    var secret = "7n0XhSdM9f9CiZQwgMJI";
    var cipherPassword = CryptoJS.AES.encrypt(req.body.password, secret);
    console.log("ENCRYPTION PASSWORD:" + cipherPassword + typeof(cipherPassword));

    var newName = req.body.password_name;
    var newPass = cipherPassword.toString();
    
    var password = req.body.password;
    
    //calculate password strength func
    var passwordStrength = function() {
        //strength meter
        var strength = 0;
        //lower case letters
        var lowerCaseLetters = /[a-z]/g;
        //uppercase letters
        var upperCaseLetters = /[A-Z]/g;
        //numbers
        var numbers = /[0-9]/g;
        
        var specialCharacters = /[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/;
        
        if (password.match(lowerCaseLetters)) {
            strength+=1;
        }
        
        if (password.match(upperCaseLetters)) {
            strength+=1;
        }
        
        if (password.match(numbers)) {
            strength+=1;
        }
        
        if (password.length > 8) {
            strength+=1;
        }
        
        if (password.match(specialCharacters)) {
            console.log("IT DOEEEES!!!!");
            strength+=1;
        }
        
        console.log("STREEEEENGTH" + strength);
        
        if (strength < 3) {
            return "Weak";
        }
        
        if (strength < 5) {
            return "Medium";
        }
        
        if (strength === 5) {
            return "Strong";
        }
        
    }
    
    

    passwords.forEach(findPassport);

    function findPassport(item) {

        if (item._id == id) {
            console.log("Found it!");
            var index = passwords.indexOf(item);
            console.log("Index is..." + index);
        }
    }


    User.update({
        username: username,
        "passwords._id": id
    }, {
        '$set': {
            'passwords.$.name': newName,
            'passwords.$.password': newPass,
            'passwords.$.strength': passwordStrength()
        }
    }).then(function (response) {
        if (response) {
            console.log(response);
            res.redirect('/profile');

        } else {
            console.log("user not found or something");
        }
    });




});

//delete password
router.get('/delete/:id', authCheck, function (req, res) {
    var id = req.params.id;
    console.log(id);
    var username = req.user.username;

    User.update({
        username: username
    }, {
        $pull: {
            "passwords": {
                "_id": id
            }
        }
    }).then(function (response) {
        if (response) {
            console.log(response);
            res.redirect('/profile');

        } else {
            console.log("user not found or something");
        }
    });

});

module.exports = router;
