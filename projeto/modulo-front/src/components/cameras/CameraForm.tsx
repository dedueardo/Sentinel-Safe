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
    ip_camera: initialData?.ip_camera || '',
    nome: initialData?.nome || '',
    modelo: initialData?.modelo || '',
    localizacao: initialData?.localizacao || '',
    data_instalacao: initialData?.data_instalacao || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Converte data_instalacao para Date se estiver preenchida
      const payload = {
        ...formData,
        data_instalacao: formData.data_instalacao ? new Date(formData.data_instalacao) : new Date(),
      };
      await onSubmit(payload);
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-800">
      <InputField label="IP da Câmera" name="ip_camera" value={formData.ip_camera} onChange={handleChange} required />
      <InputField label="Nome" name="nome" value={formData.nome} onChange={handleChange} required />
      <InputField label="Modelo" name="modelo" value={formData.modelo} onChange={handleChange} required />
      <InputField label="Localização" name="localizacao" value={formData.localizacao} onChange={handleChange} />
      <InputField
        label="Data de Instalação"
        name="data_instalacao"
        type="date"
        value={formData.data_instalacao}
        onChange={handleChange}
      />

      {/* Botões de ação */}
      <div className="flex justify-end gap-3 pt-4 border-t mt-8">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
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
