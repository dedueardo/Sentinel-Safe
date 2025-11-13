import React from 'react';
import StreamPlayer from './StreamPlayer';
import type { Camera } from '../../types/camera';

interface CameraViewProps {
    camera: Camera;
}

const CameraView: React.FC<CameraViewProps> = ({ camera }) => {
    return (
        <StreamPlayer
            streamUrl={camera.streamUrl}
            streamType={camera.streamType}
            cameraName={camera.name}
        />
    );
};

export default CameraView;