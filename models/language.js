const mongoose = require('mongoose');
// Language Schema
const languageSchema = new mongoose.Schema({
    languageName: { type: String, required: true, maxlength: 25, unique: true , default: 'English' },
    languageCode: { type: String, required: true, minlength: 2, maxlength: 2, unique: true, default: 'en' }
  });
  
  // Create an index on the languageName field
languageSchema.index({ languageName: 1 });

// Create the model
const Language = mongoose.model('Language', languageSchema);

module.exports = Language;

  