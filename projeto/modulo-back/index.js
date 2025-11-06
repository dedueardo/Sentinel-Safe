// backend/index.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
require('dotenv').config();
const { startMonitoring } = require('./services/monitoringService'); // 1. IMPORTAR O SERVIÇO DE MONITORAMENTO

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- ROTAS ---
const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const camerasRouter = require('./routes/cameras');
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/cameras', camerasRouter);

app.get('/', (req, res) => {
    res.send('Backend está funcionando!');
});

// --- WEBSOCKET ---
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Novo cliente conectado via WebSocket!');
    ws.send(JSON.stringify({ type: 'info', message: 'Conectado ao servidor WebSocket.' }));
    ws.on('message', (message) => {
        console.log('Recebido: %s', message);
    });
    ws.on('close', () => {
        console.log('Cliente desconectado.');
    });
});

// --- INICIAR SERVIDOR ---
server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    // 2. INICIAR O MONITORAMENTO APÓS O SERVIDOR ESTAR NO AR
    startMonitoring(broadcast);
});

// Função de broadcast (permanece a mesma)
function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}