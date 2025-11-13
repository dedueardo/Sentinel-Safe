const express = require('express');
const app = express();

const streamsRoutes = require('./routes/streams');
app.use('/api/streams', streamsRoutes);

module.exports = app;