import React, { useState } from 'react';
import type { Camera } from '../../types/camera';
import type { StreamType } from '../../types/camera';
import { Eye, EyeOff } from 'lucide-react';

// Tipos e interfaces permanecem os mesmos
interface CameraFormProps {
  onSubmit: (data: Omit<Camera, 'id' | 'status' | 'lastUpdated' | 'streamUrl' | 'display_order'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<Camera>;
}

// Componente InputField com estilos aprimorados
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(({ label, ...props }, ref) => (
  <div>
    <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...props}
      ref={ref}
      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
    />
  </div>
));

const STREAM_TYPES: { value: StreamType; label: string; description: string }[] = [
  { value: 'rtsp', label: 'RTSP', description: 'Real Time Streaming Protocol (câmeras IP)' },
  { value: 'mjpeg', label: 'MJPEG', description: 'Motion JPEG (câmeras web simples)' },
];

function CameraForm({ onSubmit, onCancel, initialData }: CameraFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    url: initialData?.url || '',
    streamType: (initialData?.streamType || 'rtsp') as StreamType,
    username: initialData?.username || '',
    password: '',
    location: initialData?.location || '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData as any);
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <InputField label="Nome da Câmera" name="name" value={formData.name} onChange={handleChange} required />

      {/* Tipo de stream (apenas RTSP e MJPEG) */}
      <div>
        <label htmlFor="streamType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Tipo de Stream <span className="text-red-500">*</span>
        </label>
        <select
          id="streamType"
          name="streamType"
          value={formData.streamType}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
        >
          {STREAM_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label} - {type.description}
            </option>
          ))}
        </select>
      </div>

      <InputField
        label="URL do Stream"
        name="url"
        value={formData.url}
        onChange={handleChange}
        placeholder={
          formData.streamType === 'rtsp'
            ? 'rtsp://user:pass@192.168.1.100:554/stream1'
            : 'http://192.168.1.100:8080/video' // MJPEG
        }
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputField label="Usuário" name="username" value={formData.username} onChange={handleChange} />
        <div className="relative">
          <InputField label="Senha" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
      </div>

      <InputField label="Localização" name="location" value={formData.location} onChange={handleChange} placeholder="Ex: Entrada Principal" />

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed">
          {isSubmitting ? (initialData ? 'Salvando...' : 'Adicionando...') : (initialData ? 'Salvar Alterações' : 'Adicionar Câmera')}
        </button>
      </div>
    </form>
  );
}

export default CameraForm;