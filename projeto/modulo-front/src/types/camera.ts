export interface Camera {
  id: string; 
  name: string;
  url: string;
  status: 'online' | 'offline' | 'connecting';
  username?: string;
  password?: string;
  location?: string;
  description?: string;
  lastUpdated: string;
}