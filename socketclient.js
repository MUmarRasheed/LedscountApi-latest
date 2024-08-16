const io = require('socket.io-client');

// Replace with your server's URL
const socket = io('http://localhost:3000');

// Listen for the 'connect' event
socket.on('connect', () => {
    console.log('Connected to server');

    // Test emitting 'setMatchSettings' event
    socket.emit('setMatchSettings', {
        "deviceID": "3030F952C5B4",
        "matchSettings": {
            "goldenBallMode": true,
            "tieBreakMode": true,
            "tieBreakGames": 5,
            "setsToWinMatch": 2,
            "sound": true,
            "teamRed": {
                "player1": "Arturo Coello",
                "player2": "Alejandro Galan"
            },
            "teamBlue": {
                "player1": "Juan Lebron",
                "player2": "Francisco Navarro"
            }
        }
    });
    console.log('Sent setMatchSettings event');

    // Test emitting 'scoreUpdate' event
    socket.emit('scoreUpdate', {
        "deviceID": "4030F952Ch6",
        "matchScore": {
            "playing": true,
            "started": "2024-07-09T17:23:34.008",
            "lastPointMade": "2024-07-09T18:46:11.375",
            "teamServing": "R",
            "score": [
                {
                    "team": "R",
                    "s1": 5,
                    "s2": 6,
                    "s3": 5,
                    "p": "40"
                },
                {
                    "team": "B",
                    "s1": 5,
                    "s2": 4,
                    "s3": 3,
                    "p": "30"
                }
            ]
        }
    });
});
console.log('Sent scoreUpdate event');

// Listen for 'setMatchSettings' event from the server
socket.on('setMatchSettings', (data) => {
    console.log('Received match settings update:', data);
});

// Listen for 'scoreUpdate' event from the server
socket.on('scoreUpdate', (data) => {
    console.log('Received score update:', data);
});


// Handle disconnection
socket.on('disconnect', () => {
    console.log('Disconnected from server');
});
