let socket: WebSocket | null = null;
const listeners: { [key: string]: Array<(data: any) => void> } = {};

/**
 * Constrói a URL do WebSocket de forma inteligente, sempre usando um caminho relativo.
 * O proxy do Vite (em dev) ou um reverse proxy (em prod) cuidará do redirecionamento.
 */
const getWebSocketURL = (): string => {
  const override = import.meta.env.VITE_WS_URL;
  if (override) return override;
  const host = window.location.host;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${host}/ws-status`;
};

/**
 * Inicia e gerencia a conexão com o WebSocket.
 */
export const connectWebSocket = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log('WebSocket de status já está conectado.');
    return;
  }

  const WS_URL = getWebSocketURL();
  console.log(`Tentando conectar ao WebSocket de status em: ${WS_URL}`);
  
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log('WebSocket de status conectado com sucesso.');
  };

  socket.onmessage = (event) => {
    try {
      const parsedData = JSON.parse(event.data);
      
      // Verifica se o tipo de mensagem existe na lista de listeners
      if (parsedData.type && listeners[parsedData.type]) {
        // Chama cada callback registrado para aquele tipo de mensagem
        listeners[parsedData.type].forEach(callback => callback(parsedData.payload));
      }
    } catch (error) {
      console.error('Erro ao processar mensagem do WebSocket:', error, 'Dados recebidos:', event.data);
    }
  };

  socket.onclose = () => {
    console.log('WebSocket de status desconectado. Tentando reconectar em 5 segundos...');
    socket = null; // Limpa a instância do socket
    setTimeout(connectWebSocket, 5000); // Tenta reconectar após 5 segundos
  };

  socket.onerror = (error) => {
    console.error('Erro no WebSocket de status:', error);
    // O 'onclose' será chamado automaticamente após um erro, então a lógica de reconexão já é acionada.
    socket?.close();
  };
};

/**
 * Registra uma função (callback) para ser chamada quando uma mensagem de um tipo específico é recebida.
 * @param type - O tipo da mensagem a ser ouvida (ex: 'status_update').
 * @param callback - A função a ser executada com os dados da mensagem.
 * @returns Uma função para cancelar a inscrição (cleanup).
 */
export const onWebSocketMessage = (type: string, callback: (data: any) => void) => {
  if (!listeners[type]) {
    listeners[type] = [];
  }
  listeners[type].push(callback);

  // Retorna uma função para que o componente possa se "desinscrever" do evento ao ser desmontado.
  return () => {
    listeners[type] = listeners[type].filter(cb => cb !== callback);
  };
};

/**
 * Envia uma mensagem para o servidor através do WebSocket.
 * @param message - O objeto da mensagem a ser enviado.
 */
export const sendWebSocketMessage = (message: any) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.error('WebSocket não está conectado. Não foi possível enviar a mensagem.');
  }
};