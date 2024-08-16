const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const deviceRoutes = require('./routes/deviceRoutes');
const clubRoutes = require('./routes/clubRoutes');
const databaseConfig = require('./config/databaseConnection');

const app = express();
const port = process.env.PORT || 3000;

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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
