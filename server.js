const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000 // Fails fast with an error if it cannot reach Atlas within 5 seconds
})
.then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Define Unified Lead Schema & Model supporting multiple projects
const leadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    projectName: { type: String, required: true }, // Tracks whether it's Krishna Avenue or Krishna Edifice
    date: { type: Date, default: Date.now }
});

const Lead = mongoose.model('KrishnaLead', leadSchema);

// API Route to Handle Lead Submission from both landing pages
app.post('/api/leads', async (req, res) => {
    try {
        const { name, phone, email, projectName } = req.body;

        if (!name || !phone || !projectName) {
            return res.status(400).json({ success: false, message: 'Name, phone, and project name are required.' });
        }

        const newLead = new Lead({
            name,
            phone,
            email,
            projectName
        });

        await newLead.save();
        console.log(`📥 New Lead Saved for [${projectName}]: ${name} (${phone})`);
        res.status(201).json({ success: true, message: 'Lead saved successfully!' });
    } catch (error) {
        console.error('❌ Error saving lead:', error);
        res.status(500).json({ success: false, message: 'Server error while saving lead.' });
    }
});

// Test Route
app.get('/', (req, res) => {
    res.send('Krishna Sister Projects Backend is running live!');
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});