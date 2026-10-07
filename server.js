const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./src/routes/chat');
const voiceRoutes = require('./src/routes/voice');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', chatRoutes);
app.use('/api/voice', voiceRoutes);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔═════════════════════════
    🎓 KLH Smart AI Assistant is running!         
    🌐 URL: http://localhost:${PORT}                 
    🤖 Powered by Google Gemini AI  
    `);
});
