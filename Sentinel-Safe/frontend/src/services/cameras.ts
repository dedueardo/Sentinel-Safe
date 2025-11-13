import api from './api';
import type { Camera } from '../types/camera';

// 1. Definir o tipo para os dados do formulário para reutilização e clareza
type CameraFormData = Omit<Camera, 'id' | 'status' | 'lastUpdated' | 'streamUrl' | 'display_order'>;

// 2. Definir o tipo para o payload da função de reordenar
type ReorderPayload = {
  id: string;
  order: number;
}[];

export const camerasService = {
  /**
   * Busca a lista de todas as câmeras do usuário logado.
   */
  list: async (): Promise<Camera[]> => {
    const response = await api.get<Camera[]>('/cameras');
    return response.data;
  },

  /**
   * Cria uma nova câmera.
   * @param data - Os dados da câmera a ser criada (sem id, status, etc.)
   */
  // 3. CORREÇÃO: Usar o tipo CameraFormData
  create: async (data: CameraFormData): Promise<Camera> => {
    const response = await api.post<Camera>('/cameras', data);
    return response.data; // Retorna a câmera criada pelo backend
  },

  /**
   * Atualiza os dados de uma câmera existente.
   * @param id - O ID da câmera a ser atualizada.
   * @param data - Os campos da câmera a serem modificados.
   */
  // 4. CORREÇÃO: Usar Partial<CameraFormData> para atualizações parciais
  update: async (id: string, data: Partial<CameraFormData>): Promise<void> => {
    await api.put(`/cameras/${id}`, data);
  },

  /**
   * Deleta uma câmera.
   * @param id - O ID da câmera a ser deletada.
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/cameras/${id}`);
  },

  /**
   * Atualiza a ordem de exibição de múltiplas câmeras.
   * @param orderPayload - Um array de objetos contendo o ID e a nova ordem de cada câmera.
   */
  reorder: async (orderPayload: ReorderPayload): Promise<void> => {
    await api.patch('/cameras/reorder', { order: orderPayload });
  },

  getStatus: async (id: string): Promise<{ status: 'online' | 'offline' }> => {
    console.warn(
      'getStatus é simulado. O status real deve vir via WebSockets.'
    );
    return Promise.resolve({
      status: Math.random() > 0.5 ? 'online' : ('offline' as const),
    });
  },
};
