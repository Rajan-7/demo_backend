const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Route for auth page
app.get("/auth.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "auth.html"));
});

// Route for mails page
// Optional: protect mails.html so it can't be opened directly
app.get("/mails.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "mails.html"));
});

// Schema & model
// const EmailSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   createdAt: { type: Date, default: Date.now },
// });
// const Email = mongoose.model("Email", EmailSchema);

// POST: Save email
// app.post("/subscribe", async (req, res) => {
//   console.log("API Hit: /subscribe");
//   try {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ error: "Email is required" });

//     const newEmail = new Email({ email });
//     await newEmail.save();

//     res.status(201).json({ message: "Email saved successfully", email });
//   } catch (err) {
//     console.error("Error saving email:", err);
//     res.status(500).json({ error: "Failed to save email" });
//   }
// });

// GET: Fetch all emails (for UI)
// app.get("/emails", async (req, res) => {
//   try {
//     const emails = await Email.find().sort({ createdAt: -1 });
//     res.json(emails);
//   } catch (err) {
//     console.error("Error fetching emails:", err);
//     res.status(500).json({ error: "Failed to fetch emails" });
//   }
// });

const EmailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  status: { type: String, default: "pending" }, // new field
  createdAt: { type: Date, default: Date.now },
});
const Email = mongoose.model("Email", EmailSchema);

// POST: Save email (status can be set dynamically later)
app.post("/subscribe", async (req, res) => {
  console.log("API Hit: /subscribe");
  try {
    const { email, status } = req.body; // accept optional status
    if (!email) return res.status(400).json({ error: "Email is required" });

    const newEmail = new Email({
      email,
      status: status || "pending", // default to pending
    });
    await newEmail.save();

    res
      .status(201)
      .json({ message: "Email saved successfully", email: newEmail });
  } catch (err) {
    console.error("Error saving email:", err);
    res.status(500).json({ error: "Failed to save email" });
  }
});

// GET: Fetch all emails
app.get("/emails", async (req, res) => {
  try {
    const emails = await Email.find().sort({ createdAt: -1 });
    res.json(emails);
  } catch (err) {
    console.error("Error fetching emails:", err);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

// PATCH: Update status of an email by ID
app.patch("/emails/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["sent", "failed", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updated = await Email.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Email not found" });

    res.json({ message: "Status updated", email: updated });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// DELETE: Remove an email by ID
app.delete("/emails/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Email.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Email not found" });

    res.json({ message: "Email deleted successfully" });
  } catch (err) {
    console.error("Error deleting email:", err);
    res.status(500).json({ error: "Failed to delete email" });
  }
});

// POST: Check the answer to the math question
app.post("/check-answer", (req, res) => {
  try {
    const { answer } = req.body;

    // You said "10" → binary of 2
    if (answer === process.env.ANSWER) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false, message: "Incorrect answer" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const corsOptions = {
  origin: ["www.hissecretobsession.pro"], // your frontend URL
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
