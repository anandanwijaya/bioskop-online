let mongoose = require('mongoose')


let adminSchema = new mongoose.Schema({
    email : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    }
})


let Admin = mongoose.model('admins', adminSchema)

module.exports = Admin