// backend/index.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const { URL } = require('url'); // Usar WHATWG URL API
require('dotenv').config();

const { startMonitoring } = require('./services/monitoringService');
const securityHeaders = require('./middleware/securityHeaders');

const app = express();
const apiPort = process.env.PORT || 3000;

// Aplicar headers de segurança ANTES de outras rotas
securityHeaders(app);

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); // Limitar tamanho do payload
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Headers CORS adicionais
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

// Rotas
const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const camerasRouter = require('./routes/cameras');
const streamsRouter = require('./routes/streams');

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/cameras', camerasRouter);
app.use('/api/streams', streamsRouter);

// Tratamento de erros global
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
});

const apiServer = http.createServer(app);
const wssStatus = new WebSocketServer({ noServer: true });

wssStatus.on('connection', (ws) => console.log('Cliente conectado para receber status!'));

apiServer.on('upgrade', (request, socket, head) => {
    try {
        const parsedUrl = new URL(request.url, `http://${request.headers.host}`);
        const pathname = parsedUrl.pathname;

        if (pathname === '/ws-status') {
            wssStatus.handleUpgrade(request, socket, head, (ws) => {
                wssStatus.emit('connection', ws, request);
            });
        } else {
            socket.destroy();
        }
    } catch (error) {
        console.error('Erro ao fazer upgrade WebSocket:', error);
        socket.destroy();
    }
});

function broadcast(data) {
    wssStatus.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            try {
                client.send(JSON.stringify(data));
            } catch (error) {
                console.error('Erro ao enviar mensagem WebSocket:', error);
            }
        }
    });
}

apiServer.listen(apiPort, () => {
    console.log(`🚀 Servidor da API rodando na porta ${apiPort}`);
    console.log(`🔒 Proteções de segurança ativadas`);
    startMonitoring(broadcast);
});

// Tratamento de shutdown gracioso
process.on('SIGTERM', () => {
    console.log('SIGTERM recebido. Fechando servidor...');
    apiServer.close(() => {
        console.log('Servidor fechado.');
        process.exit(0);
    });
});
