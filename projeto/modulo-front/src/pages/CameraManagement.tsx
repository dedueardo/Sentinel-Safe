import React, { useState } from 'react';
import { useCameras } from '../contexts/CameraContext';
import type { Camera } from '../types/camera';
import Modal from '../components/common/Modal';
import CameraForm from '../components/cameras/CameraForm';
import { Plus, Edit, Trash2 } from 'lucide-react'; // Importe os novos ícones

function CameraManagement() {
  const { cameras, loading, error, addCamera, updateCamera, deleteCamera } = useCameras();

  //  Estado para controlar a câmera que está sendo editada
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModalForCreate = () => {
    setEditingCamera(null); // Limpa os dados de edição
    setIsModalOpen(true);
  };

  const openModalForEdit = (camera: Camera) => {
    setEditingCamera(camera); // Define a câmera a ser editada
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCamera(null); // Limpa ao fechar
  };

  // Função de 'submit' que decide se deve criar ou atualizar
  const handleFormSubmit = async (data: Omit<Camera, 'id' | 'status' | 'lastUpdated'>) => {
    if (editingCamera) {
      // Modo de Edição
      await updateCamera(editingCamera.id.toString(), data);
    } else {
      // Modo de Criação
      await addCamera(data);
    }
    closeModal(); // Fecha o modal após o sucesso
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

      {/* Lista de Câmeras com botões de Ação */}
      <div className="bg-gray-800 rounded-lg shadow-md">
        <ul className="divide-y divide-gray-700">
          {cameras.map((camera) => (
            <li key={camera.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{camera.name}</p>
                <p className="text-sm text-gray-400">{camera.location || 'Sem localização'}</p>
              </div>
              <div className="flex items-center gap-x-4">
                <button onClick={() => openModalForEdit(camera)} className="text-gray-400 hover:text-white" title="Editar">
                  <Edit size={18} />
                </button>
                <button onClick={() => deleteCamera(camera.id.toString())} className="text-red-500 hover:text-red-400" title="Excluir">
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* O Modal agora é usado tanto para criar quanto para editar */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCamera ? 'Editar Câmera' : 'Adicionar Nova Câmera'}>
        <CameraForm
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          initialData={editingCamera || undefined} // Passa os dados da câmera para o formulário
        />
      </Modal>
    </>
  );
}

export default CameraManagement;