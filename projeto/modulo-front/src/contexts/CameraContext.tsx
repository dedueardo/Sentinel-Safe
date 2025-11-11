import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { camerasService } from '../services/cameras';
import type { Camera } from '../types/camera';
import { useAuth } from './AuthContext';
import { connectWebSocket, onWebSocketMessage } from '../services/websocket';
import toast from 'react-hot-toast';

interface CameraContextData {
  cameras: Camera[];
  loading: boolean;
  error: string | null;
  fetchCameras: () => Promise<void>;
  addCamera: (data: Omit<Camera, 'id' | 'status' | 'lastUpdated'>) => Promise<void>;
  updateCamera: (id: string, data: Partial<Omit<Camera, 'id'>>) => Promise<void>;
  deleteCamera: (id: string) => Promise<void>;
}

const CameraContext = createContext<CameraContextData | undefined>(undefined);

export function CameraProvider({ children }: { children: React.ReactNode }) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, token } = useAuth(); // token do AuthContext

  const fetchCameras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
    if (isAuthenticated && token) {
      fetchCameras();

      // Conecta WebSocket com token
      connectWebSocket(token);

      // Listener para atualizar status das câmeras
      const handleStatusUpdate = (data: { payload: { id: number; status: 'online' | 'offline' } }) => {
        const { id, status } = data.payload;
        setCameras((prev) =>
          prev.map((camera) =>
            camera.id.toString() === id.toString() ? { ...camera, status } : camera
          )
        );
      };

      const unsubscribe = onWebSocketMessage('status_update', handleStatusUpdate);

      // Cleanup ao desmontar provider
      return () => {
        unsubscribe();
      };
    }
  }, [isAuthenticated, token, fetchCameras]);

  const addCamera = useCallback(async (data: Omit<Camera, 'id' | 'status' | 'lastUpdated'>) => {
    await toast.promise(
      camerasService.create(data).then(newCamera => {
        setCameras((prev) => [...prev, newCamera]);
      }),
      {
        loading: 'Adicionando câmera...',
        success: <b>Câmera adicionada com sucesso!</b>,
        error: (err) => <b>{err.response?.data?.message || 'Falha ao adicionar a câmera.'}</b>,
      }
    );
  }, []);

  const updateCamera = useCallback(async (id: string, data: Partial<Omit<Camera, 'id'>>) => {
    await toast.promise(
      camerasService.update(id, data).then(() => {
        setCameras((prev) =>
          prev.map((cam) =>
            cam.id.toString() === id ? { ...cam, ...data, lastUpdated: new Date().toISOString() } : cam
          )
        );
      }),
      {
        loading: 'Salvando alterações...',
        success: <b>Câmera atualizada com sucesso!</b>,
        error: (err) => <b>{err.response?.data?.message || 'Falha ao atualizar a câmera.'}</b>,
      }
    );
  }, []);

  const deleteCamera = useCallback(async (id: string) => {
    await toast.promise(
      camerasService.delete(id).then(() => {
        setCameras((prev) => prev.filter((cam) => cam.id.toString() !== id));
      }),
      {
        loading: 'Removendo câmera...',
        success: <b>Câmera removida com sucesso!</b>,
        error: (err) => <b>{err.response?.data?.message || 'Falha ao remover a câmera.'}</b>,
      }
    );
  }, []);

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
      }}
    >
      {children}
    </CameraContext.Provider>
  );
}

export function useCameras() {
  const context = useContext(CameraContext);
  if (!context) throw new Error('useCameras deve ser usado dentro de um CameraProvider');
  return context;
}
