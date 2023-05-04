const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name !']
    },
    email: {
        type: String,
        required: [true, 'Please tell us your email !'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'Please provide  a password'],
        minlength: 8
    },
    passwordConfrim: {
        type: String,
        required: [true, 'Please confrim your password']
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;