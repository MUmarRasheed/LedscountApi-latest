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

// Request club data
const clubID = "453f49e3-990d-475d-a761-502c4f011be";

socket.emit('getClub', clubID);
console.log('Sent getClub request');
console.log('Sent scoreUpdate event');

socket.emit('getMatches', clubID);
console.log('Sent getMatches request');

// Listen for 'getMatchesData' event from the server
socket.on('getMatchesData', (data) => {
    if (data.message) {
        console.log('Matches update message:', data.message);
    } else {
        console.log('Received matches update:', data.matches);
    }
});

// Listen for 'setMatchSettings' event from the server
socket.on('setMatchSettings', (data) => {
    console.log('Received match settings update:', data);
});

// Listen for 'getMatchSettings' event from the server
socket.on('getMatchSettings', (data) => {
    console.log('Received getMatchSettings:', data);
});

// Listen for 'clubUpdate' event from the server
socket.on('getClubData', (data) => {
    if (data.message) {
        console.log('Club update message:', data.message);
    } else {
        console.log('Received club update:', data.club);
    }
});

// Handle disconnection
socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

})