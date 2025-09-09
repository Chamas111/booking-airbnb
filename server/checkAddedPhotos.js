require("dotenv").config();
const mongoose = require("mongoose");
const Place = require("./models/Place");

async function check() {
  await mongoose.connect(process.env.MONGO_URL);
  const places = await Place.find();
  for (const place of places) {
    console.log(place._id, place.addedPhotos);
  }
  mongoose.disconnect();
}

check();
