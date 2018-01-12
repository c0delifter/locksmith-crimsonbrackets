const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const passwordSchema = new Schema({
    name: String,
    password: String,
    strength: String
});







module.exports = passwordSchema;