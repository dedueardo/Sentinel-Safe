import React from 'react';
import CameraCard from './CameraCard';

interface Camera {
  id: string;
  name: string;
  streamUrl: string;
  status: 'online' | 'offline';
  lastMotionDetected?: string;
}

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
        <CameraCard
          key={camera.id}
          camera={camera}
          onClick={() => onCameraClick(camera)}
        />
      ))}
    </div>
  );
};

export default CameraGrid;