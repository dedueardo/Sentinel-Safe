// frontend/src/components/cameras/CameraGrid.tsx
import React from 'react';
import CameraCard from './CameraCard';
import type { Camera } from '../../types/camera';

interface CameraGridProps {
  cameras: Camera[];
  layout: '2x2' | '3x3' | '4x4';
  onCameraClick: (camera: Camera) => void;
}

const CameraGrid: React.FC<CameraGridProps> = ({ cameras, layout, onCameraClick }) => {
  const gridLayout = {
    '2x2': 'grid-cols-2',
    '3x3': 'grid-cols-3',
    '4x4': 'grid-cols-4'
  };

  return (
    <div className={`grid ${gridLayout[layout]} gap-4 p-4`}>
      {cameras.map((camera) => (
        <div key={camera.id} onClick={() => onCameraClick(camera)} className="cursor-pointer">
          <CameraCard
            camera={camera}
          />
        </div>
      ))}
    </div>
  );
};

export default CameraGrid;