const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const app = express();
app.use(express.json());
const jwt = require("jsonwebtoken");
const PORT = process.env.PORT || 9000;
const User = require("./models/User");
const cookieParser = require("cookie-parser");
const bcryptSalt = bcrypt.genSaltSync(10);
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());
mongoose.connect(process.env.MONGO_URL);
app.get("/test", (req, res) => {
  res.json("test ok");
});

/*register */
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

/*login */

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userDoc = await User.findOne({ email });
    if (userDoc) {
      const passOk = bcrypt.compare(password, userDoc.password);
      if (passOk) {
        const token = jwt.sign(
          { email: userDoc.email, id: userDoc._id },
          process.env.JWT_SECRET,
          {},
          (err, token) => {
            if (err) throw err;
            res.cookie("token", token).json(userDoc);
          }
        );
      }
    } else {
      res.status(422).json("pass not ok");
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, userData) => {
      if (err) throw err;
      const { name, email, _id } = await User.findById(userData.id);
      res.json({ name, email, _id });
    });
  } else {
    res.json(null);
  }
});

/* logout*/
app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});
app.listen(PORT, () => console.log(`server is runing on port ${PORT}`));
