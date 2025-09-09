require("dotenv").config();
const mongoose = require("mongoose");
const Place = require("./models/Place");

async function migrate() {
  await mongoose.connect(process.env.MONGO_URL);

  const places = await Place.find();
  for (const place of places) {
    if (place.addedPhotos?.length > 0) {
      place.photos = place.addedPhotos;
      await place.save();
      console.log("Migrated:", place._id);
    }
  }

  mongoose.disconnect();
}

migrate();
