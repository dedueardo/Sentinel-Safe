import api from './api'
import { Camera } from '../contexts/CameraContext'

export const camerasService = {
  list: async () => {
    // Por enquanto, retornamos um array vazio
    // Quando tiver o backend, substitua por api.get<Camera[]>('/cameras')
    return Promise.resolve([])
  },

  create: async (data: Omit<Camera, 'id' | 'status'>) => {
    // Simulando criação - substitua por api.post quando tiver backend
    const newCamera: Camera = {
      ...data,
      id: Date.now().toString(),
      status: 'offline',
      lastUpdated: new Date().toISOString()
    }
    return Promise.resolve(newCamera)
  },

  update: async (id: string, data: Partial<Camera>) => {
    // Simulando atualização - substitua por api.put quando tiver backend
    const updatedCamera: Camera = {
      id,
      name: data.name || '',
      url: data.url || '',
      status: data.status || 'offline',
      username: data.username,
      password: data.password,
      location: data.location,
      description: data.description,
      lastUpdated: new Date().toISOString()
    }
    return Promise.resolve(updatedCamera)
  },

  delete: async (id: string) => {
    // Simulando deleção - substitua por api.delete quando tiver backend
    return Promise.resolve()
  },

  getStatus: async (id: string) => {
    // Simulando verificação de status - substitua por api.get quando tiver backend
    return Promise.resolve({ status: Math.random() > 0.5 ? 'online' : 'offline' as const })
  }
}