export type StreamType = 'rtsp' | 'mjpeg' | 'http' | 'hls' | 'dash';

export interface Camera {
  id: string; 
  name: string;
  url: string; // A URL original da câmera
  streamType: StreamType; // NOVO: tipo de stream
  status: 'online' | 'offline' | 'connecting';
  username?: string;
  password?: string;
  location?: string;
  description?: string;
  lastUpdated?: string;
  streamUrl: string; 
}