import React, { createContext, useContext, useState, useEffect } from 'react'
import { camerasService } from '../services/cameras'
import { useNotifications } from './NotificationContext'

export interface Camera {
  id: string
  name: string
  url: string
  status: 'online' | 'offline'
  username?: string
  password?: string
  location?: string
  description?: string
  lastUpdated?: string
}

interface CameraContextData {
  cameras: Camera[]
  addCamera: (camera: Omit<Camera, 'id' | 'status'>) => Promise<void>
  updateCamera: (id: string, data: Partial<Camera>) => Promise<void>
  removeCamera: (id: string) => Promise<void>
  loading: boolean
  error: string | null
}

const CameraContext = createContext<CameraContextData | undefined>(undefined)

export function CameraProvider({ children }: { children: React.ReactNode }) {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addNotification } = useNotifications()

  // Carrega as câmeras ao iniciar
  useEffect(() => {
    loadCameras()
  }, [])

  const loadCameras = async () => {
    try {
      setLoading(true)
      const data = await camerasService.list()
      setCameras(data)
    } catch (err) {
      setError('Erro ao carregar câmeras')
      addNotification({
        type: 'error',
        message: 'Erro ao carregar lista de câmeras'
      })
    } finally {
      setLoading(false)
    }
  }

  const addCamera = async (cameraData: Omit<Camera, 'id' | 'status'>) => {
    try {
      const newCamera = await camerasService.create(cameraData)
      setCameras(prev => [...prev, newCamera])
      addNotification({
        type: 'info',
        message: `Câmera ${newCamera.name} adicionada com sucesso`
      })
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Erro ao adicionar câmera'
      })
      throw err
    }
  }

  const updateCamera = async (id: string, data: Partial<Camera>) => {
    try {
      const updatedCamera = await camerasService.update(id, data)
      setCameras(prev =>
        prev.map(camera =>
          camera.id === id ? updatedCamera : camera
        )
      )
      addNotification({
        type: 'info',
        message: `Câmera ${updatedCamera.name} atualizada com sucesso`
      })
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Erro ao atualizar câmera'
      })
      throw err
    }
  }

  const removeCamera = async (id: string) => {
    try {
      await camerasService.delete(id)
      setCameras(prev => prev.filter(camera => camera.id !== id))
      addNotification({
        type: 'info',
        message: 'Câmera removida com sucesso'
      })
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Erro ao remover câmera'
      })
      throw err
    }
  }

  // Monitor de status das câmeras
  useEffect(() => {
    const interval = setInterval(async () => {
      for (const camera of cameras) {
        try {
          const { status } = await camerasService.getStatus(camera.id)
          if (status !== camera.status) {
            updateCamera(camera.id, { status })
          }
        } catch (error) {
          console.error(`Erro ao verificar status da câmera ${camera.id}:`, error)
        }
      }
    }, 30000) // Verifica a cada 30 segundos

    return () => clearInterval(interval)
  }, [cameras])

  return (
    <CameraContext.Provider
      value={{
        cameras,
        addCamera,
        updateCamera,
        removeCamera,
        loading,
        error
      }}
    >
      {children}
    </CameraContext.Provider>
  )
}

export function useCameras() {
  const context = useContext(CameraContext)
  if (context === undefined) {
    throw new Error('useCameras deve ser usado dentro de um CameraProvider')
  }
  return context
}