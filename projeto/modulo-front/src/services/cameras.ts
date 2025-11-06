import api from './api'
import type { Camera } from '../types/camera' // 1. Import corrigido e centralizado

export const camerasService = {
  /**
   * Busca a lista de todas as câmeras do usuário logado.
   */
  list: async (): Promise<Camera[]> => {
    const response = await api.get<Camera[]>('/cameras')
    return response.data
  },

  /**
   * Cria uma nova câmera.
   * @param data - Os dados da câmera a ser criada (sem id, status, etc.)
   */
  create: async (
    data: Omit<Camera, 'id' | 'status' | 'lastUpdated'>
  ): Promise<Camera> => {
    const response = await api.post<Camera>('/cameras', data)
    return response.data // Retorna a câmera criada pelo backend
  },

  /**
   * Atualiza os dados de uma câmera existente.
   * @param id - O ID da câmera a ser atualizada.
   * @param data - Os campos da câmera a serem modificados.
   */
  update: async (
    id: string,
    data: Partial<Omit<Camera, 'id' | 'lastUpdated'>>
  ): Promise<void> => {
    await api.put(`/cameras/${id}`, data)
  },

  /**
   * Deleta uma câmera.
   * @param id - O ID da câmera a ser deletada.
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/cameras/${id}`)
  },
  getStatus: async (id: string): Promise<{ status: 'online' | 'offline' }> => {
    console.warn(
      'getStatus é simulado. O status real deve vir via WebSockets.'
    )
    return Promise.resolve({
      status: Math.random() > 0.5 ? 'online' : ('offline' as const),
    })
  },
}