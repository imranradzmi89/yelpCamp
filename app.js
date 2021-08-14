require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const {campgroundSchema } = require('./schemas.js');
const {reviewSchema} = require('./schemas.js')
const Review = require('./models/review.js')
//package to utilize PUT,PATCH & DELETE routes
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const catchAsync = require('./utilities/catchAsync');
const ExpressError = require('./utilities/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
//removes Mongo injections
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet');
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
const MongoDBStore = require('connect-mongo');
//import routers
const userRoutes = require('./routes/users');
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')

mongoose.connect(dbURL ,
    {
        useNewUrlParser:true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify : false
    })

const db = mongoose.connection;
db.on('error' , console.error.bind(console , "connection error: "))
db.once('open' , () => {
    console.log('Database Connected!')
})

app.engine('ejs' , ejsMate)
app.set('view engine', 'ejs');
app.set('views' , path.join(__dirname, 'views'));
//middleware to serve static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


//connect-mongo configuration
const store = new MongoDBStore({
    mongoUrl: dbURL,
    collection: 'sessions',
    secret: 'bettersecret',
    touchAfter: 24*60*60
})

store.on('error', (e) => {
    console.log('Session Store Error')
})

//config & use cookies & msg flash
const sessionConfig = {
    store: store,
    name: 'session',
    secret : 'shouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000*3600*24*7,
        maxAge: 1000*3600*24*7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

//helmet configuration for content security policy
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://code.jquery.com/jquery-3.5.1.slim.min.js"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
    "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
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
                "https://res.cloudinary.com/dudfcjvoe/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// local storage for flash msg & user variables
app.use( (req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


//router middleware
app.use('/campgrounds' , campgrounds)
app.use('/campgrounds/:id/reviews' , reviews)
app.use('/' , userRoutes)

app.get('/', (req, res) => {
    res.render('home')
});

app.all('*' , (req,res,next) => {
    next( new ExpressError('Page Not Found', 404))
})

app.use( (err, req,res,next) => {
    const {statusCode = 500 } = err;
    if(!err.message) err.message = "Oh no. Something went wrong!"
    res.status(statusCode).render('error' , {err})
} )

const port = process.env.PORT || 3000;
app.listen(port , () => { 
    console.log(`Serving on port ${port}`)
})