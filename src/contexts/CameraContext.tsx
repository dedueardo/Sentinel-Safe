import React, { createContext, useContext, useState, useEffect } from 'react'

interface Camera {
  id: string
  name: string
  url: string
  status: 'online' | 'offline'
  username?: string
  location?: string
  description?: string
  lastUpdated?: string
}

interface CameraContextData {
  cameras: Camera[]
  addCamera: (camera: Omit<Camera, 'id' | 'status'>) => void
  updateCamera: (id: string, data: Partial<Camera>) => void
  removeCamera: (id: string) => void
  isLoading: boolean
}

const CameraContext = createContext<CameraContextData | undefined>(undefined)

export function CameraProvider({ children }: { children: React.ReactNode }) {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simula carregamento inicial das câmeras
    // Em produção, isso seria uma chamada API
    setTimeout(() => {
      setCameras([
        {
          id: '1',
          name: 'Câmera Principal',
          url: 'rtsp://exemplo.com/camera1',
          status: 'online',
          location: 'Entrada Principal',
        },
        {
          id: '2',
          name: 'Câmera Lateral',
          url: 'rtsp://exemplo.com/camera2',
          status: 'offline',
          location: 'Lateral Esquerda',
        },
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const addCamera = (cameraData: Omit<Camera, 'id' | 'status'>) => {
    const newCamera: Camera = {
      ...cameraData,
      id: Date.now().toString(),
      status: 'offline',
    }
    setCameras(prev => [...prev, newCamera])
  }

  const updateCamera = (id: string, data: Partial<Camera>) => {
    setCameras(prev =>
      prev.map(camera =>
        camera.id === id ? { ...camera, ...data } : camera
      )
    )
  }

  const removeCamera = (id: string) => {
    setCameras(prev => prev.filter(camera => camera.id !== id))
  }

  return (
    <CameraContext.Provider
      value={{
        cameras,
        addCamera,
        updateCamera,
        removeCamera,
        isLoading,
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