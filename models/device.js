const mongoose = require('mongoose');

const matchSettingsSchema = new mongoose.Schema({
  goldenBallMode: { type: Boolean, required: true },
  tieBreakMode: { type: Boolean, required: true },
  tieBreakGames: { type: Number, required: true },
  setsToWinMatch: { type: Number, required: true },
  sound: { type: Boolean, required: true },
  teamRed: {
    player1: { type: String, required: false },
    player2: { type: String, required: false }
  },
  teamBlue: {
    player1: { type: String, required: false },
    player2: { type: String, required: false }
  }
});

const scoreSchema = new mongoose.Schema({
  team: { type: String, required: true },
  s1: { type: Number, required: true },
  s2: { type: Number, required: true },
  s3: { type: Number, required: true },
  p: { type: String, required: true }
});

const matchScoreSchema = new mongoose.Schema({
  playing: { type: Boolean, required: true },
  started: { type: Date, required: true },
  lastPointMade: { type: Date, required: true },
  teamServing: { type: String, required: true },
  score: [scoreSchema]
});

const deviceSchema = new mongoose.Schema({
  deviceID: { type: String, required: true },
  clubID: { type: String, required: true },
  testMode: { type: Boolean, default: false },
  courtNumber: { type: String, required: true },
  firmwareVersion: { type: String, required: true },
  matchSettings: matchSettingsSchema,
  matchScore: matchScoreSchema
});

module.exports = mongoose.model('Device', deviceSchema);
