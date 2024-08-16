const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  clubID: { type: String, required: true, unique: true },
  hubID :  {type: String, required: true, unique:true },
  clubName: { type: String, required: true },
  clubCity: { type: String, required: true },
  timeZoneOffset: { type: String, required: true }
});

module.exports = mongoose.model('Club', clubSchema);
