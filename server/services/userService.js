const User = require("../models/userModel.js");

async function findAll() {
    return User.find({}).select('-hashedPassword');
}

module.exports = {findAll};