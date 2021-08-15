const express = require('express');
const router = express.Router( {mergeParams: true} );
const catchAsync = require('../utilities/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review')
const ExpressError = require('../utilities/ExpressError');
const {reviewSchema} = require('../schemas.js')
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware.js');
const reviews = require('../controllers/reviews.js')

router.use( (req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

router.post('' , isLoggedIn, validateReview, catchAsync(reviews.createReview) );

router.delete('/:reviewId' ,isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;