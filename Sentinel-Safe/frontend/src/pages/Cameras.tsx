import React, { useState, useMemo } from 'react';
import { useCameras } from '../contexts/CameraContext';
import type { Camera } from '../types/camera';
import Modal from '../components/common/Modal';
import CameraForm from '../components/cameras/CameraForm';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToParentElement } from '@dnd-kit/modifiers';

interface SortableCameraItemProps {
  camera: Camera;
  onEdit: (camera: Camera) => void;
  onDelete: (id: string) => void;
}

function SortableCameraItem({ camera, onEdit, onDelete }: SortableCameraItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: camera.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1, opacity: isDragging ? 0.5 : 1 };

  return (
    <li ref={setNodeRef} style={style} {...attributes} className="p-4 flex items-center justify-between bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 relative">
      <div className="flex items-center gap-x-4">
        <button {...listeners} className="cursor-grab text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white focus:outline-none" title="Reordenar">
          <GripVertical size={20} />
        </button>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{camera.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{camera.location || 'Sem localização'}</p>
        </div>
      </div>
      <div className="flex items-center gap-x-4">
        <button onClick={() => onEdit(camera)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white" title="Editar">
          <Edit size={18} />
        </button>
        <button onClick={() => onDelete(camera.id.toString())} className="text-red-500 hover:text-red-400" title="Excluir">
          <Trash2 size={18} />
        </button>
      </div>
    </li>
  );
}

// Este é o seu componente de página, ex: CameraManagement.tsx
function CameraManagement() {
  const { cameras, loading, error, addCamera, updateCamera, deleteCamera, reorderCameras } = useCameras();

  // Estados para o modal de Adicionar/Editar
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // NOVO: Estados para o modal de confirmação de exclusão
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [cameraToDeleteId, setCameraToDeleteId] = useState<string | null>(null);

  const cameraIds = useMemo(() => cameras.map((cam) => cam.id), [cameras]);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  // Funções para o modal de Adicionar/Editar
  const openModalForCreate = () => { setEditingCamera(null); setIsFormModalOpen(true); };
  const openModalForEdit = (camera: Camera) => { setEditingCamera(camera); setIsFormModalOpen(true); };
  const closeModal = () => { setIsFormModalOpen(false); setEditingCamera(null); };
  const handleFormSubmit = async (data: Omit<Camera, 'id' | 'status' | 'lastUpdated' | 'streamUrl' | 'display_order'>) => { if (editingCamera) { await updateCamera(editingCamera.id.toString(), data); } else { await addCamera(data); } closeModal(); };

  // AJUSTADO: Funções para o modal de exclusão
  const requestDeleteCamera = (id: string) => {
    setCameraToDeleteId(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (cameraToDeleteId) {
      deleteCamera(cameraToDeleteId);
    }
    // Fecha o modal após confirmar
    setIsConfirmModalOpen(false);
    setCameraToDeleteId(null);
  };

  const handleCancelDelete = () => {
    // Apenas fecha o modal
    setIsConfirmModalOpen(false);
    setCameraToDeleteId(null);
  };

  function handleDragEnd(event: DragEndEvent) { const { active, over } = event; if (over && active.id !== over.id) { const oldIndex = cameras.findIndex((cam) => cam.id === active.id); const newIndex = cameras.findIndex((cam) => cam.id === over.id); reorderCameras(oldIndex, newIndex); } }

  if (loading) return <div className="text-gray-800 dark:text-white text-center p-4">Carregando...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciar Câmeras</h1>
        <button onClick={openModalForCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          <Plus size={20} />
          Adicionar Câmera
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
          <SortableContext items={cameraIds} strategy={verticalListSortingStrategy}>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {cameras.length > 0 ? cameras.map((camera) => (
                // AJUSTADO: A prop onDelete agora chama a função que abre o modal
                <SortableCameraItem key={camera.id} camera={camera} onEdit={openModalForEdit} onDelete={requestDeleteCamera} />
              )) : (
                <li className="p-4 text-gray-500 dark:text-gray-400 text-center">Nenhuma câmera cadastrada.</li>
              )}
            </ul>
          </SortableContext>
        </DndContext>
      </div>

      {/* Modal para Adicionar/Editar Câmera */}
      <Modal isOpen={isFormModalOpen} onClose={closeModal} title={editingCamera ? 'Editar Câmera' : 'Adicionar Nova Câmera'}>
        <CameraForm onSubmit={handleFormSubmit} onCancel={closeModal} initialData={editingCamera || undefined} />
      </Modal>

      {/* NOVO: Modal de Confirmação para Excluir Câmera */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Remover Câmera"
        message="Tem certeza que deseja remover esta câmera? Esta ação não poderá ser desfeita."
        confirmText="Sim, remover"
      />
    </>
  );
}

export default CameraManagement;