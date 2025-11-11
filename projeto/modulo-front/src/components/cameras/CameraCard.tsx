import React from 'react';
import ReactPlayer from 'react-player';
import type { Camera } from '../../types/camera';
import { VideoOff, Settings, Signal } from 'lucide-react';

interface CameraCardProps {
  camera: Camera;
  onSettingsClick?: (camera: Camera) => void;
}

function CameraCard({ camera, onSettingsClick }: CameraCardProps) {
  const isOnline = camera.status === 'online';

  // Garantir que a URL não seja undefined
  const url = camera.url || '';
  const name = camera.name || 'Câmera';
  const location = camera.location || 'Sem localização';

  // Verifica se é stream MJPEG
  const isMjpegStream = url.includes('cgi-bin') || url.includes('mjpg');

  // Função que decide qual player renderizar
  const renderPlayer = () => {
    if (isMjpegStream) {
      return (
        <img
          src={url}
          alt={`Stream da ${name}`}
          className="w-full h-full object-contain"
          onError={(e) => console.warn(`Erro ao carregar stream MJPEG da câmera ${name}:`, e)}
        />
      );
    }

    return (
      <ReactPlayer
        url={url}
        playing
        muted
        width="100%"
        height="100%"
        controls={false}
        onError={(e) => console.warn(`Erro ao carregar stream de vídeo da câmera ${name}:`, e)}
      />
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col group">
      <div className="relative aspect-video bg-black flex items-center justify-center">
        {isOnline ? (
          renderPlayer()
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
            <h3 className="font-bold text-white truncate">{name}</h3>
            <p className="text-sm text-gray-400">{location}</p>
          </div>
          <div className="flex items-center gap-x-3">
            <div
              className={`flex items-center gap-x-1.5 px-2 py-1 rounded-full text-xs font-medium ${isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}
            >
              <Signal size={12} />
              {isOnline ? 'Online' : 'Offline'}
            </div>
            {onSettingsClick && (
              <button
                onClick={() => onSettingsClick(camera)}
                className="text-gray-400 hover:text-white transition-opacity duration-300 opacity-0 group-hover:opacity-100"
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
