import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import http from "http";

interface AuthenticatedClient {
    id_user: number;
    ws: WebSocket;
}
const clients: AuthenticatedClient[] = [];

// Inicializa WebSocket com servidor HTTP
export function initWebSocket(server: http.Server) {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws, req) => {
        console.log("🟢 Novo cliente tentando conectar via WebSocket");

        const params = new URLSearchParams(req.url?.split("?")[1]);
        const token = params.get("token");

        if (!token) {
            console.log("❌ Conexão recusada: token ausente.");
            ws.close();
            return;
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "segredo_dev") as { id_user: number };
            clients.push({ id_user: decoded.id_user, ws });
            console.log(`✅ Cliente conectado (usuário ${decoded.id_user})`);
        } catch {
            console.log("❌ Conexão recusada: token inválido.");
            ws.close();
            return;
        }

        ws.on("message", (msg) => {
            console.log(`📩 Mensagem recebida do usuário: ${msg.toString()}`);
        });

        ws.on("close", () => {
            const index = clients.findIndex(c => c.ws === ws);
            if (index >= 0) clients.splice(index, 1);
            console.log(`🔴 Cliente desconectado`);
        });
    });
}

// Funções utilitárias
export function broadcast(type: string, payload: any) {
    const data = JSON.stringify({ type, payload });
    for (const client of clients) {
        if (client.ws.readyState === WebSocket.OPEN) client.ws.send(data);
    }
}

export function sendToUser(id_user: number, type: string, payload: any) {
    const data = JSON.stringify({ type, payload });
    const client = clients.find(c => c.id_user === id_user);
    if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
    }
}
