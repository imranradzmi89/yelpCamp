const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const passport = require('passport')
const User = require('../models/user')

router.use( (req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

router.get('/register' , (req,res) => {
    res.render('users/register')
})
router.post('/register' , async (req,res) => {
    try{
        const {email,username,password} = req.body;
        const user = new User({email,username});
        const registeredUser = await User.register(user,password);
        req.login(registeredUser , err => {
            if (err) return next(err);
            req.flash('success' , 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
        
    } catch (err) {
        req.flash('error' , err.message );
        res.redirect('/register')
    }
    
    
})

router.get('/login' , (req,res) => {
    res.render('users/login')
})

//login route with passport's auth middleware
router.post('/login' , passport.authenticate('local' , {failureFlash: true, failureRedirect : '/login'}) , (req,res) => {
    req.flash('success' , 'Welcome Back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get('/logout' , (req,res) => {
    req.logout();
    req.flash('success' , 'Logged Out!');
    res.redirect('/campgrounds')
})

router.get('/home' , (req,res)=> {
    res.render('home')
})


module.exports = router;