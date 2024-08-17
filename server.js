const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const deviceRoutes = require('./routes/deviceRoutes');
const clubRoutes = require('./routes/clubRoutes');
const databaseConfig = require('./config/databaseConnection');
const http = require('http');
const socketIo = require('socket.io');
const Device = require('./models/device'); // Import the Device model
const Club = require('./models/club'); // Import the Device model

const app = express();
const port = process.env.PORT || 3000;

// Create server using HTTP
const server = http.createServer(app);

// Initialize Socket.io on the server
const io = socketIo(server);

// Enable Mongoose debug mode
mongoose.set('debug', true);
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

    // // // Listen for 'setMatchSettings' event from clients
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
                socket.emit('getMatchSettings',{ deviceID: device.deviceID, courtNumber:device.courtNumber,testMode: device.testMode, matchSettings: device.matchSettings 
                })
            } else {
                socket.emit('getMatchSettings','no match found')
            }
        } catch (error) {
            console.error('Error updating match settings:', error);
        }
    });

    // Emit a club update when a club is fetched
    socket.on('getClub', async (clubID) => {
        console.log('Received getClub request:', clubID); // Check what is received

        try {
            const club = await Club.findOne({ clubID });  // Ensure no leading/trailing spaces
            console.log('club: ', club);
            if (club) {
                socket.emit('getClubData', { clubID: club.clubID, club });
            } else {
                socket.emit('getClubData', { message: 'Club not found' });
            }
        } catch (error) {
            console.error('Error fetching club:', error);
        }
    });


    // Handle getMatches request
    socket.on('getMatches', async (clubID) => {
        console.log('Received getMatches request for clubID:', clubID);

        try {
            const matches = await Device.find({ clubID: clubID });
            if (matches.length > 0) {
                socket.emit('getMatchesData', { clubID: clubID, matches });
            } else {
                socket.emit('getMatchesData', { message: 'No matches found for this club' });
            }
        } catch (error) {
            console.error('Error fetching matches:', error);
            socket.emit('getMatchesData', { message: 'Error fetching matches' });
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
