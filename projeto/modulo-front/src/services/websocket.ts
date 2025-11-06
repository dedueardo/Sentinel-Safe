// URL do seu servidor WebSocket
const WS_URL = 'ws://localhost:3000';

let socket: WebSocket | null = null;

// Callbacks que serão registrados pelos componentes/contextos
const listeners: { [key: string]: Array<(data: any) => void> } = {};

// Função para conectar ao servidor
export const connectWebSocket = () => {
  // Evita múltiplas conexões
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log('WebSocket já está conectado.');
    return;
  }

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log('WebSocket conectado com sucesso.');
  };

  socket.onmessage = (event) => {
    try {
      const parsedData = JSON.parse(event.data);
      
      // Se houver um 'type' na mensagem, notifica os listeners daquele tipo
      if (parsedData.type && listeners[parsedData.type]) {
        listeners[parsedData.type].forEach(callback => callback(parsedData));
      }
      
      // Notifica também os listeners 'gerais'
      if (listeners['*']) {
        listeners['*'].forEach(callback => callback(parsedData));
      }
    } catch (error) {
      console.error('Erro ao processar mensagem do WebSocket:', error);
    }
  };

  socket.onclose = () => {
    console.log('WebSocket desconectado. Tentando reconectar em 5 segundos...');
    socket = null; // Limpa a instância para permitir reconexão
    setTimeout(connectWebSocket, 5000); // Tenta reconectar após 5 segundos
  };

  socket.onerror = (error) => {
    console.error('Erro no WebSocket:', error);
    socket?.close(); // Força o fechamento para acionar o 'onclose' e a reconexão
  };
};

// Função para componentes se registrarem para ouvir tipos específicos de eventos
export const onWebSocketMessage = (type: string, callback: (data: any) => void) => {
  if (!listeners[type]) {
    listeners[type] = [];
  }
  listeners[type].push(callback);

  return () => {
    listeners[type] = listeners[type].filter(cb => cb !== callback);
  };
};

// Função para enviar mensagens (se necessário)
export const sendWebSocketMessage = (message: any) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.error('WebSocket não está conectado. Não foi possível enviar a mensagem.');
  }
};