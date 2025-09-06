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
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

// Models
const User = require("./models/User");
const Place = require("./models/Place");
const Booking = require("./models/Booking");

// Middleware
app.use(express.json());
app.use(cookieParser());

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

app.use("/uploads", express.static(uploadsDir));

// CORS
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:3000"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser requests
      if (!allowedOrigins.includes(origin))
        return callback(new Error("CORS not allowed"), false);
      return callback(null, true);
    },
    credentials: true,
  })
);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL);

// Utility to get user from token
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

// Test routes
app.get("/", (req, res) => res.send("Server is running ✅"));
app.get("/test", (req, res) => res.json("Server works"));
app.get("/test-cors", (req, res) => res.json({ msg: "CORS works" }));

// Auth routes
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

// File upload
const photosMiddleware = multer({ dest: "uploads/" });

app.post("/upload", photosMiddleware.array("photos", 100), (req, res) => {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const { path: filePath, originalname } = req.files[i];
    const ext = originalname.split(".").pop();
    const newPath = filePath + "." + ext;
    fs.renameSync(filePath, newPath);
    uploadedFiles.push(path.basename(newPath));
  }
  res.json(uploadedFiles);
});

app.post("/upload-by-link", async (req, res) => {
  const { link } = req.body;
  const newName = "photo" + Date.now() + ".jpg";
  const destPath = path.join(__dirname, "uploads", newName);

  const response = await fetch(link);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));

  res.json(newName);
});

// Place routes
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

// Booking routes
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
