// frontend/src/pages/Cameras.tsx
import React, { useState } from 'react';
import { useCameras } from '../contexts/CameraContext';
import type { Camera } from '../types/camera';
import Modal from '../components/common/Modal';
import CameraForm from '../components/cameras/CameraForm';
import { Plus, Edit, Trash2 } from 'lucide-react';

function Cameras() {
  const { cameras, loading, error, addCamera, updateCamera, deleteCamera } = useCameras();

  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModalForCreate = () => {
    setEditingCamera(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (camera: Camera) => {
    setEditingCamera(camera);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCamera(null);
  };

  const handleFormSubmit = async (data: Omit<Camera, 'id' | 'status' | 'lastUpdated'>) => {
    if (editingCamera) {
      await updateCamera(editingCamera.id.toString(), data);
    } else {
      await addCamera(data);
    }
    closeModal();
  };

  const handleRemoveCamera = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta câmera?')) {
      deleteCamera(id); // Nome da função corrigido
    }
  };

  if (loading) return <div className="text-white text-center">Carregando...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Gerenciar Câmeras</h1>
        <button onClick={openModalForCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          <Plus size={20} />
          Adicionar Câmera
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md">
        <ul className="divide-y divide-gray-700">
          {cameras.length > 0 ? cameras.map((camera) => (
            <li key={camera.id} className="p-4 flex items-center justify-between hover:bg-gray-700/50">
              <div>
                <p className="font-semibold text-white">{camera.name}</p>
                <p className="text-sm text-gray-400">{camera.location || 'Sem localização'}</p>
              </div>
              <div className="flex items-center gap-x-4">
                <button onClick={() => openModalForEdit(camera)} className="text-gray-400 hover:text-white" title="Editar">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleRemoveCamera(camera.id.toString())} className="text-red-500 hover:text-red-400" title="Excluir">
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          )) : (
            <p className="p-4 text-gray-400">Nenhuma câmera cadastrada.</p>
          )}
        </ul>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCamera ? 'Editar Câmera' : 'Adicionar Nova Câmera'}>
        <CameraForm
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          initialData={editingCamera || undefined}
        />
      </Modal>
    </>
  );
}

export default Cameras;