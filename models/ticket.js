let mongoose = require('mongoose')


let actor = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    character : {
        type: String,
        required: true
    },
    image : {
        type: String,
        required: true
    }
})

let jam = new mongoose.Schema({

    jam: {
        type: String,
        required: true
    },
    seat : {
        type: Array,
        required: true
    }
})

let waktu = new mongoose.Schema({
    
    tanggal:{
        type: String,
        required: true
    },
    hari:{
        type: String,
        required: true
    },
    jam: [jam],
})

let ticketSchema = new mongoose.Schema({
    
    judul : {
        type: String,
        required: true
    },
    genre : {
        type: String,
        required: true,
    },
    tanggal : {
        type: String,
        required: true
    },
    harga : {
        type: Number,
        required: true
    },
    poster : {
        type: String,
        required: true
    },
    foto : {
        type: String,
        required: true
    },
    sinopsis : {
        type: String,
        required: true
    },
    actors: [actor],
    waktu: [waktu],
    studio : {
        type: String,
        required: true
    }
})


let Ticket = mongoose.model('tickets', ticketSchema)


module.exports = Ticket