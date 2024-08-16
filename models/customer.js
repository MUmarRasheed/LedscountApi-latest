const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    customerID: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerCity: { type: String, required: true },
    timeZoneOffset: { type: String, required: true }
});

module.exports = mongoose.model('Customer', customerSchema);
