import React, { useState } from 'react'
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

interface CameraFormData {
  name: string
  url: string
  username?: string
  password?: string
  location?: string
  description?: string
}

interface CameraFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CameraFormData) => void
  initialData?: CameraFormData
}

function CameraFormModal({ isOpen, onClose, onSubmit, initialData }: CameraFormModalProps) {
  const [formData, setFormData] = useState<CameraFormData>({
    name: initialData?.name || '',
    url: initialData?.url || '',
    username: initialData?.username || '',
    password: initialData?.password || '',
    location: initialData?.location || '',
    description: initialData?.description || ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Aqui você pode adicionar validação adicional
      if (!formData.name.trim()) {
        throw new Error('O nome da câmera é obrigatório')
      }
      
      if (!formData.url.trim()) {
        throw new Error('A URL do stream é obrigatória')
      }

      // Testa a conexão antes de submeter
      setIsTestingConnection(true)
      // Aqui você implementaria a lógica real de teste de conexão
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSubmit(formData)
      onClose()
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : 'Erro ao adicionar câmera')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    setPreviewError(null)

    try {
      // Aqui você implementaria a lógica real de teste de conexão
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Conexão estabelecida com sucesso!')
    } catch (error) {
      setPreviewError('Não foi possível conectar à câmera')
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {initialData ? 'Editar Câmera' : 'Adicionar Nova Câmera'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome da Câmera */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome da Câmera *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* URL do Stream */}
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                  URL do Stream *
                </label>
                <input
                  type="text"
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="rtsp:// ou http://"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Credenciais */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Usuário
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Localização */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Localização
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Entrada Principal"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Descrição */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Mensagem de erro */}
              {previewError && (
                <div className="text-red-600 text-sm">{previewError}</div>
              )}

              {/* Botões */}
              <div className="mt-5 sm:mt-6 flex space-x-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                >
                  {isTestingConnection ? 'Testando...' : 'Testar Conexão'}
                </button>
                <button
                  type="submit"
                  disabled={isTestingConnection}
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                >
                  {initialData ? 'Salvar Alterações' : 'Adicionar Câmera'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CameraFormModal