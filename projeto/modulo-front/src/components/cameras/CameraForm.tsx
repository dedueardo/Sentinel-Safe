import React, { useState } from 'react';
import type { Camera } from '../../types/camera';
import { Eye, EyeOff } from 'lucide-react';

interface CameraFormProps {
  onSubmit: (data: Omit<Camera, 'id' | 'status' | 'lastUpdated'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<Camera>;
}

function CameraForm({ onSubmit, onCancel, initialData }: CameraFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    url: initialData?.url || '',
    username: initialData?.username || '',
    password: '',
    location: initialData?.location || '',
    description: initialData?.description || '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-800">
      {/* ... (Toda a parte de inputs do formulário, que já está correta) ... */}
      <InputField label="Nome da Câmera" name="name" value={formData.name} onChange={handleChange} required />
      <InputField label="URL do Stream" name="url" value={formData.url} onChange={handleChange} placeholder="rtsp:// ou http://" required />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Usuário" name="username" value={formData.username} onChange={handleChange} />
        <div className="relative">
          <InputField label="Senha" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-500">
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      <InputField label="Localização" name="location" value={formData.location} onChange={handleChange} placeholder="Ex: Entrada Principal" />
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3 pt-4 border-t mt-8">
        <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          Testar Conexão
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          Cancelar
        </button>

        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-blue-400">
          {isSubmitting
            ? (initialData ? 'Salvando...' : 'Adicionando...')
            : (initialData ? 'Salvar Alterações' : 'Adicionar Câmera')}
        </button>

      </div>
    </form>
  );
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
const InputField = ({ label, ...props }: InputFieldProps) => (
  <div>
    <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {props.required && '*'}
    </label>
    <input
      {...props}
      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

export default CameraForm;