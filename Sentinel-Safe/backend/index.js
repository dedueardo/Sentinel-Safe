// backend/index.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const url = require('url');
require('dotenv').config();

const { startMonitoring } = require('./services/monitoringService');
const app = express();
const apiPort = process.env.PORT || 3000;

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const camerasRouter = require('./routes/cameras');
const streamsRouter = require('./routes/streams');

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/cameras', camerasRouter);
app.use('/api/streams', streamsRouter);

const apiServer = http.createServer(app);
const wssStatus = new WebSocketServer({ noServer: true });

wssStatus.on('connection', (ws) => console.log('Cliente conectado para receber status!'));

apiServer.on('upgrade', (request, socket, head) => {
    const pathname = url.parse(request.url).pathname;
    if (pathname === '/ws-status') {
        wssStatus.handleUpgrade(request, socket, head, (ws) => {
            wssStatus.emit('connection', ws, request);
        });
    }
});

function broadcast(data) {
    wssStatus.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

apiServer.listen(apiPort, () => {
    console.log(`Servidor da API rodando na porta ${apiPort}`);
    startMonitoring(broadcast);
});
