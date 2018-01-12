const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const pswrds = require('./passwords-model');
const bcrypt = require('bcryptjs');



const userSchema = new Schema({
    username: String,
    googleId: String,
    facebookId: String,
    local_password: String,
    passwords: [pswrds]

});


//model names are capitalized by convention
const User = mongoose.model('user', userSchema);



module.exports = User;

module.exports.createUser = function(newUser, callback){
    
    var salt = bcrypt.genSaltSync(10);
	
    bcrypt.hash(newUser.local_password, salt, function(err, hash) {
        newUser.local_password = hash;
        newUser.save(callback);
    });
}


module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}