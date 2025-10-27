import React, { useState } from 'react'
import { useCameras } from '../contexts/CameraContext'
import CameraCard from '../components/cameras/CameraCard'
import CameraFormModal from '../components/cameras/CameraFormModal'
import { ViewColumnsIcon } from '@heroicons/react/24/outline'

function Dashboard() {
  const { cameras, updateCamera, isLoading } = useCameras()
  const [layout, setLayout] = useState<'2x2' | '3x3' | '4x4'>('3x3')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCamera, setEditingCamera] = useState<any>(null)

  const gridConfig = {
    '2x2': 'grid-cols-2',
    '3x3': 'grid-cols-3',
    '4x4': 'grid-cols-4',
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
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
        </div>
      </div>

      <div className={`grid ${gridConfig[layout]} gap-6`}>
        {cameras.map((camera) => (
          <CameraCard
            key={camera.id}
            name={camera.name}
            status={camera.status}
            onSettings={() => {
              setEditingCamera(camera)
              setIsModalOpen(true)
            }}
          />
        ))}
      </div>

      <CameraFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCamera(null)
        }}
        onSubmit={(data) => {
          if (editingCamera) {
            updateCamera(editingCamera.id, data)
          }
          setIsModalOpen(false)
          setEditingCamera(null)
        }}
        initialData={editingCamera}
      />
    </div>
  )
}

export default Dashboard