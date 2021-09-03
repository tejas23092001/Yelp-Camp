const mongoose = require("mongoose")
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')
const Campground = require("../models/campground")

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database Connected")
})

const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i <= 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author: "6131f418c923bf1928c3c1df",
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.Nesciunt eum id laborum similique eligendi ipsa accusamus? A mollitia sequi deserunt distinctio nesciunt reiciendis excepturi voluptas quis? Cumque, consequuntur recusandae.Vel ? ',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dzq3k36pp/image/upload/v1630428081/YelpCamp/bwytdorchvwsqorptrqh.jpg',
                    filename: 'YelpCamp/pds337xtpdtqtcgtges9'
                },
                {
                    url: 'https://res.cloudinary.com/dzq3k36pp/image/upload/v1630428064/YelpCamp/q5w479ynk29xzbs9p6rq.jpg',
                    filename: 'YelpCamp/p6bnsgev8co6iavrgmgd'
                },
                {
                    url: 'https://res.cloudinary.com/dzq3k36pp/image/upload/v1630428020/YelpCamp/ij677gmzpkaa7ila9xp6.jpg',
                    filename: 'YelpCamp/d7coujdh7oytcfye9jmn'
                }
            ]
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})