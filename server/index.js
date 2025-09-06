// index.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8000;

// ----------------- Cloudinary config -----------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ----------------- Models -----------------
const User = require("./models/User");
const Place = require("./models/Place");
const Booking = require("./models/Booking");

// ----------------- Middleware -----------------
app.use(express.json());
app.use(cookieParser());

// ----------------- CORS -----------------
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://bookingappl.netlify.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser requests
      if (!allowedOrigins.includes(origin)) {
        return callback(new Error("CORS not allowed"), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// ----------------- MongoDB -----------------
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ----------------- Utility: get user from token -----------------
function getUserDataFromToken(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies.token;
    if (!token) return resolve(null);
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
      if (err) return reject(err);
      resolve(userData);
    });
  });
}

// ----------------- Auth routes -----------------
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    res.json(user);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(422).json("Invalid email or password");

    const passOk = await bcrypt.compare(password, user.password);
    if (!passOk) return res.status(422).json("Invalid email or password");

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      })
      .json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

app.get("/profile", async (req, res) => {
  try {
    const userData = await getUserDataFromToken(req);
    if (!userData) return res.json(null);
    const user = await User.findById(userData.id);
    res.json({ name: user.name, email: user.email, _id: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- File uploads -----------------

// Multer setup for temp file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Upload local files → Cloudinary
app.post("/upload", upload.array("photos", 100), async (req, res) => {
  try {
    const urls = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "bookingapp",
      });
      urls.push(result.secure_url);
      fs.unlinkSync(file.path); // remove local file after uploading
    }
    res.json(urls); // return full URLs
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Upload by link → Cloudinary
app.post("/upload-by-link", async (req, res) => {
  const { link } = req.body;
  try {
    const result = await cloudinary.uploader.upload(link, {
      folder: "bookingapp",
    });
    res.json(result.secure_url); // return full URL
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Cannot upload image from provided link" });
  }
});

// ----------------- Place routes -----------------
app.post("/places", async (req, res) => {
  try {
    const userData = await getUserDataFromToken(req);
    if (!userData) return res.status(401).json("Not logged in");

    const place = await Place.create({ ...req.body, owner: userData.id });
    res.json(place);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/user-places", async (req, res) => {
  try {
    const userData = await getUserDataFromToken(req);
    if (!userData) return res.status(401).json("Not logged in");

    const places = await Place.find({ owner: userData.id });
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/places/:id", async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    res.json(place);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/places", async (req, res) => {
  try {
    const places = await Place.find();
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- Booking routes -----------------
app.post("/bookings", async (req, res) => {
  try {
    const userData = await getUserDataFromToken(req);
    if (!userData) return res.status(401).json("Not logged in");

    const booking = await Booking.create({ ...req.body, user: userData.id });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/bookings", async (req, res) => {
  try {
    const userData = await getUserDataFromToken(req);
    if (!userData) return res.status(401).json("Not logged in");

    const bookings = await Booking.find({ user: userData.id }).populate(
      "place"
    );
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- Health check -----------------
app.get("/", (req, res) => {
  res.send("✅ Server is running");
});

// ----------------- Start server -----------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
