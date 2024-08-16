const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const deviceRoutes = require('./routes/deviceRoutes');
const clubRoutes = require('./routes/clubRoutes');
const databaseConfig = require('./config/databaseConnection');
const http = require('http');
const socketIo = require('socket.io');
const Device = require('./models/device'); // Import the Device model

const app = express();
const port = process.env.PORT || 3000;

// Create server using HTTP
const server = http.createServer(app);

// Initialize Socket.io on the server
const io = socketIo(server);

// Middleware
app.use(bodyParser.json());

// Database connection
mongoose.connect(databaseConfig.url, {}).then(() => {
    console.log('Connected to the database');
}).catch(err => {
    console.log('Failed to connect to the database', err);
});

app.get("/", (req, res) => {
    res.send("Welcome to the ledcount api");
});

// Routes
app.use(deviceRoutes);
app.use(clubRoutes);

// WebSocket connection handler
io.on('connection', (socket) => {
    console.log('New client connected');

    // Listen for 'setMatchSettings' event from clients
    socket.on('setMatchSettings', async (data) => {
        console.log('Received setMatchSettings event:', data);

        try {
            // Update the match settings in the database
            const device = await Device.findOneAndUpdate(
                { deviceID: data.deviceID },
                { testMode: data.testMode, matchSettings: data.matchSettings },
                { new: true }
            );

            if (device) {
                console.log('Match settings updated', device);
            } else {
                console.log('Device not found');
            }
        } catch (error) {
            console.error('Error updating match settings:', error);
        }
    });

    // Listen for 'scoreUpdate' event from clients
    socket.on('scoreUpdate', async (data) => {
        console.log('Received scoreUpdate event:', data);

        try {
            // Update the match score in the database
            const device = await Device.findOneAndUpdate(
                { deviceID: data.deviceID },
                { matchScore: data.matchScore },
                { new: true }
            );

            if (device) {
                console.log('Match score updated in the database:', device);
            } else {
                console.log('Device not found in the database');
            }
        } catch (error) {
            console.error('Error updating match score:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start server using the HTTP server instance instead of app.listen
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Export the io instance for use in other files if necessary
module.exports = io;
