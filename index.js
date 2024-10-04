let express = require('express')
let app = express()
let path = require('path')
let mongoose = require('mongoose')
let methodOverride = require('method-override')
let session = require('express-session')
let bcrypt = require('bcrypt')
let dotenv = require('dotenv').config()
let port = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(express.json())
app.use(express.urlencoded( {extended: true}))
app.use(methodOverride('_method'))
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}))


mongoose.connect('mongodb://127.0.0.1:27017/ticket_db')
.then(() => console.log("sukses"))
.catch((err) => console.log(err))


let Ticket = require('./models/ticket')
let User = require('./models/users')
let Booking = require('./models/booking')
let Jam = require('./seeds/jam')
let Admin = require('./models/admins')


let auth = (req, res, next) => {
    (req.session.user_id) ? next() : res.redirect('/login')     // Jika terdapat session user_id, maka lanjut
}

let hasAuth = (req, res, next) => {
    (req.session.user_id) ? res.redirect('/') : next()    // Jika terdapat session user_id, maka redirect ke halaman dashboard
}

let authAdmin = (req, res, next) => {
    (req.session.admin_id) ? next() : res.redirect('/loginAdmin')     // Jika terdapat session admin_id, maka lanjut
}

let hasAuthAdmin = (req, res, next) => {
    (req.session.admin_id) ? res.redirect('/adminHome') : next()    // Jika terdapat session admin_id, maka redirect ke halaman dashboard
}


app.get('/login', hasAuth, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', async(req, res) => {

    let {email, password} = req.body
    let user = await User.findOne({email})
    let success = user && bcrypt.compareSync(password, user.password)
    
    success ? (req.session.user_id = user._id, res.redirect('/')) : res.redirect('/login')
})


app.get('/register', hasAuth, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', async(req, res) => {

    let {fullname, phonenumber, email, password} = req.body
    let hashPassword = bcrypt.hashSync(password, 10)
    let user = new User({fullname, phonenumber, email, password: hashPassword})
    await user.save()

    res.redirect('/login')
})


app.get('/', auth, async(req, res) => {

    let tickets = await Ticket.find({})
    let ticket1 = tickets[1]

    res.render('home.ejs', {tickets, ticket1})
})

app.get('/detail/:id', auth, async(req, res) => {
    
    let id = req.params.id
    let ticket = await Ticket.findById(id)
    res.render('detail.ejs', {ticket})
})


app.post('/detail/:id/next', auth, async (req, res) => {

    let { tanggal, jam } = req.body
    let id = req.params.id
    let ticket = await Ticket.findById(id)
    let date = ticket.waktu.find(i => i.tanggal == tanggal)
    let hour = date.jam.find(i => i.jam == jam)
    
    res.redirect(`/booking?ticketId=${ticket._id}&date=${date.tanggal}&hour=${hour.jam}`)
})
 

app.get('/booking', auth, async (req, res) => {

    let { ticketId, date, hour } = req.query
    let ticket = await Ticket.findById(ticketId)
    let tanggal = ticket.waktu.find(i => i.tanggal == date)
    let jam = tanggal.jam.find(i => i.jam == hour)

    res.render('booking.ejs', { ticket, tanggal, jam })
})

app.post('/booking', auth, async (req, res) => {

    let userId = req.session.user_id
    let {...ticket} = req.body
    let booked = new Booking(ticket)
    
    booked.user.push(userId)
    
    let newTicket = await Ticket.findById(ticket.tiketId)
    let newDate = newTicket.waktu.find(i => i.tanggal == ticket.tanggal)
    let newHour = newDate.jam.find(i => i.jam == ticket.jam)
    let newSeat = newHour.seat
    let kursi = ticket.seat.split(',')

    for (let i = 0; i < kursi.length; i++) {
        
        let index = newSeat.indexOf(kursi[i])
        if (index !== -1 && kursi[i].includes('7')) {
            newSeat.splice(index, 1, "booked7")            
        }else if(index !== -1){
            newSeat.splice(index, 1, "booked")
        }
    }
    
    await newTicket.save()
    await booked.save()

    res.redirect('/')
})


app.get('/history', auth, async (req, res) => {
    
    let userId = req.session.user_id
    let bookings = await Booking.find({}).populate('user')
    let booking = bookings.filter(i => i.user[0]._id == userId)

    res.render('history.ejs', { booking })
})


app.get('/loginAdmin', hasAuthAdmin, (req, res) => {
    res.render('admin/loginAdmin.ejs')
})

app.post('/loginAdmin', async(req, res) => {

    let {email, password} = req.body
    let admin = await Admin.findOne({email})
    let success = admin && bcrypt.compareSync(password, admin.password)
    
    success ? (req.session.admin_id = admin._id, res.redirect('/adminHome')) : res.redirect('/loginAdmin')
})


app.get('/registerAdmin', hasAuthAdmin, (req, res) => {
    res.render('admin/registerAdmin.ejs')
})

app.post('/registerAdmin', async(req, res) => {

    let {email, password} = req.body
    let hashPassword = bcrypt.hashSync(password, 10)
    let admin = new Admin({email, password: hashPassword})
    await admin.save()

    res.redirect('/loginAdmin')
})


app.get('/adminHome', authAdmin, async(req, res) => {

    let tickets = await Ticket.find({})
    res.render('admin/adminHome.ejs', { tickets })
})


app.get('/adminAdd', authAdmin, (req, res) => {

    res.render('admin/adminAdd.ejs')
})

app.post('/addMovie', async(req, res) => {
    
    let {...movie} = req.body

    let jam = Jam

    let ticket = new Ticket({
        judul: movie.judul,
        genre: movie.genre,
        tanggal: movie.tanggal,
        harga: movie.harga,
        poster: movie.poster,
        foto: movie.foto,
        sinopsis: movie.sinopsis,
        actors: [
            {
                name: movie.name1,
                character: movie.character1,
                image: movie.image1
            },
            {
                name: movie.name2,
                character: movie.character2,
                image: movie.image2
            },
            {
                name: movie.name3,
                character: movie.character3,
                image: movie.image3
            },
            {
                name: movie.name4,
                character: movie.character4,
                image: movie.image4
            },
            {
                name: movie.name5,
                character: movie.character5,
                image: movie.image5
            },
        ],
        waktu: [
            {
                tanggal: movie.tanggal1,
                hari: movie.hari1,
                jam
            },
            {
                tanggal: movie.tanggal2,
                hari: movie.hari2,
                jam
            },
            {
                tanggal: movie.tanggal3,
                hari: movie.hari3,
                jam
            },
            {
                tanggal: movie.tanggal4,
                hari: movie.hari4,
                jam
            },
            {
                tanggal: movie.tanggal5,
                hari: movie.hari5,
                jam
            }
        ],
        studio: movie.studio,
    })
    
    await ticket.save()
    
    res.redirect('/adminHome')
})

app.post('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/login')
})

app.listen(port, () => {
    console.log(`port http://localhost:${port}`)
})