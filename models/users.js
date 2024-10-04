let mongoose = require('mongoose')


let userSchema = new mongoose.Schema({
    fullname : {
        type: String,
        required: true
    },
    phonenumber : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    }
})
 

let User = mongoose.model('users', userSchema)

module.exports = User