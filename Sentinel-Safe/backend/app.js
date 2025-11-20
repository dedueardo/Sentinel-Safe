const express = require('express');
const app = express();
const { startMonitoring } = require('./services/monitoringService');
const { broadcastStatusUpdate } = require('./websocket');

const streamsRoutes = require('./routes/streams');
app.use('/api/streams', streamsRoutes);

startMonitoring((message) => {
    broadcastStatusUpdate(message); // Broadcast para os clientes conectados
});

module.exports = app;