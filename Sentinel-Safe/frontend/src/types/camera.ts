export type StreamType = 'rtsp' | 'mjpeg' | 'http' | 'hls' | 'dash';

export interface Camera {
  id: string;
  name: string;
  // A URL original da câmera é mantida no servidor e não é exposta
  url?: string;
  streamType: StreamType;
  status: 'online' | 'offline' | 'connecting';
  username?: string;
  password?: string;
  location?: string;
  description?: string;
  lastUpdated?: string;
  streamUrl: string;
}