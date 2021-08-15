const Campground = require('../models/campground.js')
const {cloudinary} = require('../cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken : mapboxToken});



module.exports.index = async (req,res) => {
    const campgrounds = await Campground.find({});
    
    res.render('campgrounds/index' ,{campgrounds} );
    }

module.exports.newCampForm = (req,res) => {
    res.render('campgrounds/new');
}

module.exports.createCamp = async (req,res,next) => {
   const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1 
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    //associates logged in user's id with created campground
    campground.author = req.user._id;
    await campground.save();
    console.log(campground)
    req.flash('success' , 'Successfully made a new campground!'); 
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req,res) => {
     const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error' , 'Campground listing not found!')
        return res.redirect('/campgrounds');
    }
    console.log(req.user)
    res.render('campgrounds/show' , {campground})
}

module.exports.renderEditForm = async (req,res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit' , {campground})
}

module.exports.editCampground = async (req,res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id , {...req.body.campground});
    const images = req.files.map( f => ({ url: f.path , filename : f.filename }))
    campground.images.push(...images);
    await campground.save();
   
    if (req.body.deleteImages){ 
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })

    }
    res.redirect(`/campgrounds/${campground.id}`)
    req.flash('success' , 'Updated Campground listing!')
    
}

module.exports.deleteCamp = async (req,res) => {
    const {id} = req.params
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}
