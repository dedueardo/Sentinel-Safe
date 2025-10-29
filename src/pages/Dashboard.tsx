import React, { useState } from 'react'
import CameraCard from '../components/cameras/CameraCard'
import CameraFormModal from '../components/cameras/CameraFormModal'
import { ViewColumnsIcon } from '@heroicons/react/24/outline'
import { useCameras } from '../contexts/CameraContext'

function Dashboard() {
  const { cameras, addCamera, updateCamera } = useCameras()
  const [layout, setLayout] = useState<'2x2' | '3x3' | '4x4'>('3x3')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCamera, setEditingCamera] = useState<any>(null)

  const gridConfig = {
    '2x2': 'grid-cols-2',
    '3x3': 'grid-cols-3',
    '4x4': 'grid-cols-4',
  }

  const handleSubmit = (data: any) => {
    if (editingCamera) {
      updateCamera(editingCamera.id, data)
    } else {
      addCamera(data)
    }
    setIsModalOpen(false)
    setEditingCamera(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Monitoramento</h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-white rounded-lg shadow p-1">
            {(['2x2', '3x3', '4x4'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setLayout(option)}
                className={`px-3 py-1 rounded ${
                  layout === option
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ViewColumnsIcon className="h-5 w-5" />
                <span className="sr-only">{option}</span>
              </button>
            ))}
          </div>
          
          <button
            onClick={() => {
              setEditingCamera(null)
              setIsModalOpen(true)
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Adicionar Câmera
          </button>
        </div>
      </div>

      <div className={`grid ${gridConfig[layout]} gap-6`}>
        {cameras.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Nenhuma câmera cadastrada</p>
          </div>
        ) : (
          cameras.map((camera) => (
            <CameraCard
              key={camera.id}
              name={camera.name}
              status={camera.status}
              onSettings={() => {
                setEditingCamera(camera)
                setIsModalOpen(true)
              }}
            />
          ))
        )}
      </div>

      <CameraFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCamera(null)
        }}
        onSubmit={handleSubmit}
        initialData={editingCamera}
      />
    </div>
  )
}

export default Dashboard