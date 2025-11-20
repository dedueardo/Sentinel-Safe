import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Camera } from '../types/camera';
import { useAuth } from './AuthContext';
import { onWebSocketMessage } from '../services/websocket';
import toast from 'react-hot-toast';
import { arrayMove } from '@dnd-kit/sortable';
import { useNotifications } from './NotificationContext';

// Definindo o tipo de dados que o formulário envia para clareza
export type CameraFormData = Omit<Camera, 'id' | 'status' | 'lastUpdated' | 'streamUrl' | 'display_order'>;

interface CameraContextData {
  cameras: Camera[];
  loading: boolean;
  error: string | null;
  fetchCameras: () => Promise<void>;
  addCamera: (data: CameraFormData) => Promise<void>;
  updateCamera: (id: string, data: Partial<CameraFormData>) => Promise<void>;
  deleteCamera: (id: string) => Promise<void>;
  reorderCameras: (oldIndex: number, newIndex: number) => void;
}

const CameraContext = createContext<CameraContextData | undefined>(undefined);

export function CameraProvider({ children }: { children: React.ReactNode }) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  const fetchCameras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { camerasService } = await import('../services/cameras');
      const data = await camerasService.list();
      setCameras(data);
    } catch (err) {
      setError('Falha ao buscar as câmeras.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCameras();
      const handleStatusUpdate = (data: { id: number; status: 'online' | 'offline' }) => {
        setCameras((prevCameras) =>
          prevCameras.map((camera) =>
            camera.id === data.id.toString() ? { ...camera, status: data.status } : camera
          )
        );
      };
      const unsubscribe = onWebSocketMessage('status_update', handleStatusUpdate);
      return () => unsubscribe();
    }
  }, [isAuthenticated, fetchCameras]);

  const addCamera = useCallback(async (data: CameraFormData) => {
    const { camerasService } = await import('../services/cameras');
    await toast.promise(
      camerasService.create(data).then(newCamera => {
        setCameras((prev) => [...prev, newCamera]);
        // Notificação de criação
        addNotification({
          type: 'camera_added',
          message: `Câmera "${newCamera.name}" adicionada`,
          cameraId: newCamera.id.toString(),
          cameraName: newCamera.name,
        });
      }),
      {
        loading: 'Adicionando câmera...',
        success: <b>Câmera adicionada com sucesso!</b>,
        error: (err) => <b>{err.response?.data?.message || 'Falha ao adicionar a câmera.'}</b>,
      }
    );
  }, [addNotification]);

  // 👇 E AQUI 👇
  const updateCamera = useCallback(async (id: string, data: Partial<CameraFormData>) => {
    const { camerasService } = await import('../services/cameras');
    await toast.promise(
      camerasService.update(id, data).then(() => {
        setCameras((prev) =>
          prev.map((cam) => (cam.id.toString() === id ? { ...cam, ...data, lastUpdated: new Date().toISOString() } : cam))
        );
        // Notificação de atualização
        const name = data.name || cameras.find(c => c.id.toString() === id)?.name || 'Câmera';
        addNotification({
          type: 'camera_updated',
          message: `Câmera "${name}" atualizada`,
          cameraId: id,
          cameraName: name,
        });
      }),
      {
        loading: 'Salvando alterações...',
        success: <b>Câmera atualizada com sucesso!</b>,
        error: (err) => <b>{err.response?.data?.message || 'Falha ao atualizar a câmera.'}</b>,
      }
    );
  }, [addNotification, cameras]);

  const deleteCamera = useCallback(async (id: string) => {
    const { camerasService } = await import('../services/cameras');
    const name = cameras.find(c => c.id.toString() === id)?.name || 'Câmera';
    await toast.promise(
      camerasService.delete(id).then(() => {
        setCameras((prev) => prev.filter((cam) => cam.id.toString() !== id));
        // Notificação de remoção
        addNotification({
          type: 'camera_deleted',
          message: `Câmera "${name}" removida`,
          cameraId: id,
          cameraName: name,
        });
      }),
      {
        loading: 'Removendo câmera...',
        success: <b>Câmera removida com sucesso!</b>,
        error: (err) => <b>{err.response?.data?.message || 'Falha ao remover a câmera.'}</b>,
      }
    );
  }, [addNotification, cameras]);

  const reorderCameras = useCallback(async (oldIndex: number, newIndex: number) => {
    const reorderedCameras = arrayMove(cameras, oldIndex, newIndex);
    setCameras(reorderedCameras);
    const orderPayload = reorderedCameras.map((camera, index) => ({
      id: camera.id,
      order: index,
    }));
    try {
      const { camerasService } = await import('../services/cameras');
      await camerasService.reorder(orderPayload);
    } catch (error) {
      console.error("Falha ao salvar a nova ordem:", error);
      toast.error("Não foi possível salvar a nova ordem.");
      setCameras(cameras); // Reverte o estado em caso de erro na API
    }
  }, [cameras]);

  return (
    <CameraContext.Provider
      value={{
        cameras,
        loading,
        error,
        fetchCameras,
        addCamera,
        updateCamera,
        deleteCamera,
        reorderCameras,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
}

export function useCameras() {
  const context = useContext(CameraContext);
  if (context === undefined) {
    throw new Error('useCameras deve ser usado dentro de um CameraProvider');
  }
  return context;
}