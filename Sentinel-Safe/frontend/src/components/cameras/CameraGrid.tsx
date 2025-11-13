import React from 'react';
import CameraCard from './CameraCard';
import type { Camera } from '../../types/camera';
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
  rectSortingStrategy, // Uma boa estratégia para grids
} from '@dnd-kit/sortable';

// 2. Adicionar a nova propriedade 'onReorder'
interface CameraGridProps {
  cameras: Camera[];
  layout: '2x2' | '3x3' | '4x4';
  onCameraClick: (camera: Camera) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
}

const CameraGrid: React.FC<CameraGridProps> = ({ cameras, layout, onCameraClick, onReorder }) => {
  const gridLayout = {
    '2x2': 'grid-cols-2',
    '3x3': 'grid-cols-3',
    '4x4': 'grid-cols-4',
  };

  // 3. Configurar os sensores para detectar o arrasto (mouse, toque, teclado)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 4. Implementar a função que é chamada ao final do arrasto
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    // Se 'over' for nulo, o item foi solto fora de uma área válida
    if (!over) return;

    if (active.id !== over.id) {
      // Encontra o índice original e o novo índice do item no array
      const oldIndex = cameras.findIndex((cam) => cam.id === active.id);
      const newIndex = cameras.findIndex((cam) => cam.id === over.id);

      // Chama a função passada pelo componente pai para atualizar a ordem
      onReorder(oldIndex, newIndex);
    }
  }

  return (
    // 5. Envolver tudo no DndContext
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {/* 6. Envolver a lista de itens no SortableContext */}
      <SortableContext items={cameras} strategy={rectSortingStrategy}>
        <div className={`grid ${gridLayout[layout]} gap-4 p-4`}>
          {cameras.map((camera) => (
            // 7. O CameraCard agora é o item ordenável.
            // Ele precisa ter sido modificado para usar o hook 'useSortable'.
            <CameraCard
              key={camera.id}
              camera={camera}
              onClick={() => onCameraClick(camera)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default CameraGrid;