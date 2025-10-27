import React from 'react'

function Settings() {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Configurações</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Notificações</span>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-lg transition-colors text-sm">
            Ativar
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings