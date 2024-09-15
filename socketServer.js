// socketServer.js

const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const databaseConfig = require('./config/databaseConnection');
const Device = require('./models/device'); // Import the Device model
const Club = require('./models/club'); // Import the Club model

// Create HTTP server
const server = http.createServer();

// Initialize Socket.io on the server
const io = socketIo(server, {
    cors: {
        origin: "*", // Adjust with your frontend URL if needed
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
});

// Enable Mongoose debug mode
mongoose.set('debug', true);

// Database connection
mongoose.connect(databaseConfig.url, {}).then(() => {
    console.log('Connected to the database');
}).catch(err => {
    console.log('Failed to connect to the database', err);
});

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

// Start the Socket.io server on a separate port (e.g., 4000)
const port = process.env.SOCKET_PORT || 4000;
server.listen(port, () => {
    console.log(`Socket.io server is running on port ${port}`);
});
