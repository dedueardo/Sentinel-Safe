import "dotenv/config";
import http from "http";
import app from "./app";
import { initWebSocket } from "./websocket/websocketServer";

const PORT = process.env.PORT || 3000;

// Cria servidor HTTP
const server = http.createServer(app);

// Inicializa WebSocket passando o servidor HTTP
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
