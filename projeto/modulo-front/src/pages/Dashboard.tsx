import React from 'react';
import { Link } from 'react-router-dom';
import { useCameras } from '../contexts/CameraContext';
import CameraCard from '../components/cameras/CameraCard';

function Dashboard() {
  const { cameras, loading, error } = useCameras();

  if (loading) return <div className="text-white text-center">Carregando câmeras...</div>;
  if (error) return <div className="text-red-500 text-center">Erro ao buscar câmeras: {error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard de Monitoramento</h1>

      {cameras.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cameras.map((camera) => (
            //  Passando o objeto 'camera' completo para o CameraCard
            <CameraCard key={camera.id} camera={camera} />
          ))}
        </div>
      ) : (
        <div className="text-center bg-gray-800 p-8 rounded-lg">
          <h2 className="text-xl font-semibold text-white">Nenhuma câmera encontrada</h2>
          <p className="text-gray-400 mt-2">Vá para a página de gerenciamento para adicionar sua primeira câmera.</p>
          <Link to="/cameras">
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
              Gerenciar Câmeras
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Dashboard;