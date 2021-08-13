const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds')
//authenticator middleware using passport's in-built helper
const {isLoggedIn , isAuthor, validateCampground} = require('../middleware.js');
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});



//show all or create new camp routes
router.route('/')
.get(catchAsync (campgrounds.index))
.post(isLoggedIn, upload.array('images') ,validateCampground, catchAsync(campgrounds.createCamp))

//create campground form 
router.get('/new' , isLoggedIn , campgrounds.newCampForm);
    
     
//show, edit or delete particular listing routes
router.route('/:id')
.get(catchAsync (campgrounds.showCampground) )
.put(isLoggedIn, isAuthor, upload.array('images') , validateCampground, catchAsync (campgrounds.editCampground) )
.delete( catchAsync( campgrounds.deleteCamp))


//edit route
router.get('/:id/edit' , isLoggedIn, isAuthor, catchAsync (campgrounds.renderEditForm) )

    

module.exports = router;