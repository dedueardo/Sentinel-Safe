import { useNotifications } from '../contexts/NotificationContext';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 3000;

  constructor(private url: string, private addNotification: Function) {}

  connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket Connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };

      this.ws.onclose = () => {
        console.log('WebSocket Disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };
    } catch (error) {
      console.error('WebSocket Connection Error:', error);
    }
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'MOTION_DETECTED':
        this.addNotification({
          type: 'motion',
          message: `Movimento detectado na câmera ${data.cameraName}`,
          cameraId: data.cameraId,
        });
        break;
      case 'PERSON_DETECTED':
        this.addNotification({
          type: 'person',
          message: `Pessoa detectada na câmera ${data.cameraName}`,
          cameraId: data.cameraId,
        });
        break;
      case 'CAMERA_STATUS':
        // Atualizar status da câmera
        break;
      default:
        console.log('Mensagem não tratada:', data);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Tentativa de reconexão ${this.reconnectAttempts}`);
        this.connect();
      }, this.reconnectTimeout);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}