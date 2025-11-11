let socket: WebSocket | null = null;

// Callbacks registrados por tipo de mensagem
const listeners: { [type: string]: Array<(data: any) => void> } = {};

// 🔹 Conecta ao WebSocket, passando token JWT
export const connectWebSocket = (token: string) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log("WebSocket já está conectado.");
    return;
  }

  // Passa token na query string
  const WS_URL = `ws://localhost:3000/?token=${token}`;
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("WebSocket conectado com sucesso.");
  };

  socket.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data);

      // Notifica listeners específicos
      if (parsed.type && listeners[parsed.type]) {
        listeners[parsed.type].forEach((cb) => cb(parsed));
      }

      // Notifica listeners globais
      if (listeners["*"]) {
        listeners["*"].forEach((cb) => cb(parsed));
      }
    } catch (err) {
      console.error("Erro ao processar mensagem do WebSocket:", err);
    }
  };

  socket.onclose = () => {
    console.log("WebSocket desconectado. Tentando reconectar em 5s...");
    socket = null;
    // ❌ Reconexão automática removida para evitar loop infinito
  };

  socket.onerror = (err) => {
    console.error("Erro no WebSocket:", err);
    socket?.close();
  };
};

// 🔹 Registrar listener para um tipo de mensagem
export const onWebSocketMessage = (type: string, callback: (data: any) => void) => {
  if (!listeners[type]) listeners[type] = [];
  listeners[type].push(callback);

  return () => {
    listeners[type] = listeners[type].filter((cb) => cb !== callback);
  };
};

// 🔹 Envia mensagem para o servidor (se necessário)
export const sendWebSocketMessage = (message: any) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.error("WebSocket não está conectado. Mensagem não enviada.");
  }
};
