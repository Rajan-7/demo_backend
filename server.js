const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const nodemailer = require("nodemailer");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const EmailSchema = new mongoose.Schema({ email: String });
const Email = mongoose.model("Email", EmailSchema);

// API route
app.post("/subscribe", async (req, res) => {
  console.log("Api Hit");
  try {
    const { email } = req.body;
    console.log(email, "sent");

    const newEmail = new Email({ email });
    await newEmail.save();

    await transporter.sendMail({
      from: `The Genius Wave <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to The Genius Wave 🌊",
      text: "Thank you for subscribing! Stay tuned for exclusive updates.",
      html: `<h2>Welcome to <span style="color:blue">The Genius Wave</span> 🌊</h2>
             <p>You're officially part of our community. Expect special updates soon.</p>
             <p>For more information, click the link below</p>
             <a href="https://hop.clickbank.net/?affiliate=guddu110&vendor=hissecret&lp=0&tid=fb"
                style="display:inline-block; margin-top:10px; padding:10px 20px;
                background:#004e92; color:white; text-decoration:none;
                border-radius:5px;">
                Visit Us
             </a>`,
    });

    res.status(201).send("Email saved & notification sent");
    console.log("Success");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving email or sending notification");
  }
});

// Start server on dynamic port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
