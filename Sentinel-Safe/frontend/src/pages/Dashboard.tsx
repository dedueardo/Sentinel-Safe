import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCameras } from '../contexts/CameraContext';
import CameraCard from '../components/cameras/CameraCard';

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
  rectSortingStrategy,
  sortableKeyboardCoordinates, //  <-- ADICIONADO AQUI
} from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';

function Dashboard() {
  const { cameras, loading, error, reorderCameras } = useCameras();
  const cameraIds = useMemo(() => cameras.map((cam) => cam.id), [cameras]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = cameras.findIndex((cam) => cam.id === active.id);
      const newIndex = cameras.findIndex((cam) => cam.id === over.id);
      reorderCameras(oldIndex, newIndex);
    }
  }

  if (loading) return <div className="text-gray-800 dark:text-white text-center p-4">Carregando câmeras...</div>;
  if (error) return <div className="text-red-500 text-center p-4">Erro ao buscar câmeras: {error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Dashboard de Monitoramento</h1>

      {cameras.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToParentElement]}
        >
          <SortableContext items={cameraIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cameras.map((camera) => (
                <CameraCard key={camera.id} camera={camera} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Nenhuma câmera encontrada</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Vá para a página de gerenciamento para adicionar sua primeira câmera.</p>
          <Link to="/cameras" className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Gerenciar Câmeras
          </Link>
        </div>
      )}
    </div>
  );
}

export default Dashboard;