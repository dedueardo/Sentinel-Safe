import React from 'react';
import type { Camera } from '../../types/camera';
import { VideoOff, Settings, Signal } from 'lucide-react';
import CameraView from './CameraView';

// Framer Motion foi removido
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CameraCardProps {
  camera: Camera;
  onSettingsClick?: (camera: Camera) => void;
  onClick?: () => void;
}

function CameraCard({ camera, onSettingsClick, onClick }: CameraCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: camera.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOnline = camera.status === 'online';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 
        rounded-lg shadow-lg overflow-hidden flex flex-col group
        border border-gray-200 dark:border-transparent
        touch-none relative
        transition-shadow duration-300 ease-in-out
        ${onClick ? 'cursor-pointer' : 'cursor-grab'}
        ${isDragging ? 'z-50 shadow-2xl scale-105 -rotate-2 cursor-grabbing' : 'z-0 shadow-lg'}
      `}
    >
      <div className="relative aspect-video bg-black flex items-center justify-center">
        {isOnline && camera.streamUrl ? (
          // CORREÇÃO: Passar o objeto 'camera' completo, não apenas streamUrl
          <CameraView camera={camera} />
        ) : (
          <div className="text-gray-500 flex flex-col items-center">
            <VideoOff size={48} />
            <span className="mt-2 text-sm">Câmera Offline</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white truncate">{camera.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{camera.location || 'Sem localização'}</p>
          </div>
          <div className="flex items-center gap-x-3">
            <div
              className={`flex items-center gap-x-1.5 px-2 py-1 rounded-full text-xs font-medium ${isOnline
                ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:red-400'
                }`}
            >
              <Signal size={12} />
              {isOnline ? 'Online' : 'Offline'}
            </div>
            {onSettingsClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSettingsClick(camera);
                }}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                title="Configurações da Câmera"
              >
                <Settings size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CameraCard;