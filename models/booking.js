let mongoose = require('mongoose')


let bookingSchema = new mongoose.Schema({
    judul : {
        type: String,
        required: true
    },
    foto: {
        type: String,
        required: true  
    },
    tanggal : {
        type: String,
        required: true
    },
    jam : {
        type: String,
        required: true
    },
    studio : {
        type: String,
        required: true
    },
    seat : {
        type: Array,
        required: true
    },
    harga : {
        type: Number,
        required: true
    }, 
    jumlah : {
        type: Number,
        required: true
    },
    total : {
        type: Number,
        required: true
    },
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    }]
})


let Booking = mongoose.model('booking', bookingSchema)

module.exports = Booking