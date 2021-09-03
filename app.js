if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}


console.log(process.env.SECRET)
console.log(process.env.API_KEY)

const express = require("express")
const path = require('path')
const mongoose = require("mongoose")
const ejsMate = require("ejs-mate")
const expressError = require('./utils/expressError')
const methodOverride = require("method-override")
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash')
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user")
const helmet = require('helmet')
const mongoSanitize = require("express-mongo-sanitize")
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
//'mongodb://localhost:27017/yelp-camp'

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database Connected")
})

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize())

const secret = process.env.SECRET || 'thisshouldbeabettersecret'

const store = new MongoStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 3600
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'MyPage',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 604800000,
        maxAge: 604800000
    }
}

app.use(session(sessionConfig))
app.use(flash())
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dzq3k36pp/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    console.log(req.query)
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'tejas@gmail.com', username: 'tejas-ss' })
    const newUser = await User.register(user, 'Boruto')
    res.send(newUser)
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new expressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something Went Wrong' } = err
    if (!err.message) err.message = 'OH NO !!! SOMETHING WENT WRONG!!!'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Listening On ${port}`)
})