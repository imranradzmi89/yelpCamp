const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (arr) => arr[Math.floor(Math.random()*arr.length)]

const seedDB = async() =>
{
    await Campground.deleteMany({});
    for (let i =0; i<300; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20);
        const camp = new Campground({
            author: '60f6db8d68e17333307f236f',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat quod laborum iste, dolorem omnis itaque quia sunt consequuntur possimus saepe maiores optio inventore vero quae suscipit ducimus odit magnam eaque!',
            price: price + 0.99,
            geometry: {
              type: "Point",
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude,
              ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dudfcjvoe/image/upload/v1627369402/YelpCamp/xd81fh3lk9prbc3a0h6t.jpg',
                    filename: 'YelpCamp/xd81fh3lk9prbc3a0h6t'
                  },
                  {
                    url: 'https://res.cloudinary.com/dudfcjvoe/image/upload/v1627369401/YelpCamp/azpzsphcrgdoyu95o8lg.jpg',
                    filename: 'YelpCamp/azpzsphcrgdoyu95o8lg'
                  },
                  {
                    url: 'https://res.cloudinary.com/dudfcjvoe/image/upload/v1627369402/YelpCamp/jfqu9axck8cthzelxxhi.jpg',
                    filename: 'YelpCamp/jfqu9axck8cthzelxxhi'
                  },
                  {
                    url: 'https://res.cloudinary.com/dudfcjvoe/image/upload/v1627369403/YelpCamp/gaxi4jcry1eeszgjditt.jpg',
                    filename: 'YelpCamp/gaxi4jcry1eeszgjditt'
                  },
                  {
                    url: 'https://res.cloudinary.com/dudfcjvoe/image/upload/v1627369403/YelpCamp/loin0an0mydln7lhp4qk.jpg',
                    filename: 'YelpCamp/loin0an0mydln7lhp4qk'
                  },
                  {
                    url: 'https://res.cloudinary.com/dudfcjvoe/image/upload/v1627369403/YelpCamp/pjbqtw95ua8abx0idkjq.jpg',
                    filename: 'YelpCamp/pjbqtw95ua8abx0idkjq'
                  }
              
                    
              
            ]
        })
        await camp.save()
    }
    
}

seedDB().then(() => {
    mongoose.connection.close();
})

