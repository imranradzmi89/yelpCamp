const mongoose = require('mongoose')
const Review = require('./review.js')
const Schema = mongoose.Schema

//must reference image schema in order to use virtual properties 
const ImageSchema = new Schema({
    url: String, 
    filename: String
})

//Mongoose does not automatically include virtuals in JSON
const opts = { toJSON: {virtuals: true} };

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload' , '/upload/w_200')
})
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts)

//mongoose middleware to delete all associated reviews with parent campground
CampgroundSchema.post('findOneAndDelete' , async function (doc){
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

//cluster map popup text & link to campground
CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `<a href="/campgrounds/${this._id}">${this.title}</a>
    <p>${this.description.substring(0,60)}...</p>`
})

module.exports = mongoose.model('Campground', CampgroundSchema);
