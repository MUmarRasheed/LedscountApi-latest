const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  clubID: { type: String, required: true, unique: true },
  hubID: { type: String },
  clubName: { type: String, required: false },
  clubCity: { type: String, required: false },
  timeZoneOffset: { type: String, required: false },
  partners: [{ partnerID: String }] // Add this line
});

// // Create indexes
// clubSchema.index({ clubID: 1 }, { unique: true, background: true });
// clubSchema.index({ hubID: 1 }, { unique: true, background: true });

module.exports = mongoose.model('Club', clubSchema);
