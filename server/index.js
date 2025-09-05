const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const imageDownloader = require("image-downloader");

require("dotenv").config();

const User = require("./models/User");
const Place = require("./models/Place");
const Booking = require("./models/Booking");

const app = express();
const PORT = process.env.PORT || 10000;
const bcryptSalt = bcrypt.genSaltSync(10);

// --- CORS ---
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL, // e.g., https://bookingappl.netlify.app
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser requests
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "CORS policy does not allow access from this origin";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// --- Middlewares ---
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// --- Helpers ---
async function getUserDataFromToken(req) {
  const token = req.cookies?.token;
  if (!token) return null;
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
      if (err) return reject(err);
      resolve(userData);
    });
  });
}

// --- Routes ---

app.get("/test", (req, res) => res.json("test ok"));

// Register
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(user);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userDoc = await User.findOne({ email });
    if (!userDoc) return res.status(422).json("User not found");

    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (!passOk) return res.status(422).json("Wrong password");

    const token = jwt.sign(
      { email: userDoc.email, id: userDoc._id },
      process.env.JWT_SECRET
    );
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .json(userDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Profile
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

// Logout
app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

// Upload images by link
app.post("/upload-by-link", async (req, res) => {
  const { link } = req.body;
  const newName = "photo" + Date.now() + ".jpg";
  await imageDownloader.image({
    url: link,
    dest: path.join(__dirname, "/uploads/", newName),
  });
  res.json(newName);
});

// Upload images by file
const photosMiddleware = multer({ dest: "uploads/" });
app.post("/upload", photosMiddleware.array("photos", 100), (req, res) => {
  const uploadedFiles = req.files.map((file) => {
    const ext = file.originalname.split(".").pop();
    const newPath = file.path + "." + ext;
    fs.renameSync(file.path, newPath);
    return newPath.replace("uploads/", "");
  });
  res.json(uploadedFiles);
});

// Places
app.post("/places", async (req, res) => {
  const userData = await getUserDataFromToken(req);
  if (!userData) return res.status(401).json("Not authorized");

  const placeDoc = await Place.create({ owner: userData.id, ...req.body });
  res.json(placeDoc);
});

app.get("/user-places", async (req, res) => {
  const userData = await getUserDataFromToken(req);
  if (!userData) return res.status(401).json("Not authorized");

  res.json(await Place.find({ owner: userData.id }));
});

app.get("/places/:id", async (req, res) => {
  const place = await Place.findById(req.params.id);
  res.json(place);
});

app.put("/places", async (req, res) => {
  const userData = await getUserDataFromToken(req);
  if (!userData) return res.status(401).json("Not authorized");

  const { id, ...updateData } = req.body;
  const placeDoc = await Place.findById(id);
  if (placeDoc.owner.toString() !== userData.id)
    return res.status(403).json("Forbidden");

  Object.assign(placeDoc, updateData);
  await placeDoc.save();
  res.json("ok");
});

// Get all places (home page)
app.get("/places", async (req, res) => {
  res.json(await Place.find());
});

// Bookings
app.post("/bookings", async (req, res) => {
  const userData = await getUserDataFromToken(req);
  if (!userData) return res.status(401).json("Not authorized");

  const booking = await Booking.create({ ...req.body, user: userData.id });
  res.json(booking);
});

app.get("/bookings", async (req, res) => {
  const userData = await getUserDataFromToken(req);
  if (!userData) return res.status(401).json("Not authorized");

  const bookings = await Booking.find({ user: userData.id }).populate("place");
  res.json(bookings);
});

// --- Serve React in production ---
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../client/build");
  if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(buildPath, "index.html"));
    });
  } else {
    console.warn("React build folder not found:", buildPath);
  }
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
