import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { camerasService } from '../services/cameras';
import type { Camera } from '../types/camera';
import { useAuth } from './AuthContext';
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
  const { isAuthenticated } = useAuth();

  const fetchCameras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await camerasService.list();
      setCameras(data);
    } catch (err: any) {
      console.error(err);
      setError('Falha ao buscar câmeras.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCameras();
    }
  }, [isAuthenticated, fetchCameras]);

  const addCamera = useCallback(async (data: Omit<Camera, 'id' | 'status' | 'lastUpdated'>) => {
    await toast.promise(
      camerasService.create(data).then(newCamera => {
        setCameras(prev => [...prev, newCamera]);
      }),
      {
        loading: 'Adicionando câmera...',
        success: 'Câmera adicionada com sucesso!',
        error: 'Falha ao adicionar câmera.',
      }
    );
  }, []);

  const updateCamera = useCallback(async (id: string, data: Partial<Omit<Camera, 'id'>>) => {
    await toast.promise(
      camerasService.update(id, data).then(() => {
        setCameras(prev =>
          prev.map(cam => cam.id.toString() === id ? { ...cam, ...data, lastUpdated: new Date().toISOString() } : cam)
        );
      }),
      {
        loading: 'Atualizando câmera...',
        success: 'Câmera atualizada com sucesso!',
        error: 'Falha ao atualizar câmera.',
      }
    );
  }, []);

  const deleteCamera = useCallback(async (id: string) => {
    await toast.promise(
      camerasService.delete(id).then(() => {
        setCameras(prev => prev.filter(cam => cam.id.toString() !== id));
      }),
      {
        loading: 'Removendo câmera...',
        success: 'Câmera removida com sucesso!',
        error: 'Falha ao remover câmera.',
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
