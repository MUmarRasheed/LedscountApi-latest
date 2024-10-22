const mongoose = require('mongoose');

// Match Settings Schema
const matchSettingsSchema = new mongoose.Schema({
  goldenBallMode: { type: Boolean, required: true },
  tieBreakMode: { type: Boolean, required: true },
  tieBreakGames: { type: Number, required: true },
  setsToWinMatch: { type: Number, required: true },
  sound: { type: Boolean, required: true },
  language: { type: String, required: false, minlength: 2, maxlength: 2 }, // ISO 639 Language Code
  teamRed: {
    player1: { type: String, required: false },
    player2: { type: String, required: false }
  },
  teamBlue: {
    player1: { type: String, required: false },
    player2: { type: String, required: false }
  }
});

// Score Schema
const scoreSchema = new mongoose.Schema({
  team: { type: String, required: true },
  s1: { type: Number, required: true },
  s2: { type: Number, required: true },
  s3: { type: Number, required: true },
  p: { type: Number, required: true } // Changed from String to Number
});

// Match Score Schema
const matchScoreSchema = new mongoose.Schema({
  playing: { type: Boolean, required: true },
  started: { type: Date }, // Made optional
  lastPointMade: { type: Date }, // Made optional
  teamServing: { type: String, required: true },
  score: [scoreSchema],
  temperature: { type: Number } // Added temperature field
});

// Device Schema
const deviceSchema = new mongoose.Schema({
  deviceID: { type: String, required: true },
  clubID: { type: String, required: true },
  testMode: { type: Boolean, default: false },
  courtNumber: { type: String, required: false },
  firmwareVersion: { type: String, required: false },
  matchSettings: matchSettingsSchema,
  matchScore: matchScoreSchema,
  lastSeen: { type: Date }, // Add this field for the heartbeat functionality
});

module.exports = mongoose.model('Device', deviceSchema);
