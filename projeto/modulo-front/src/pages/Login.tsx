import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError('Email ou senha inválidos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    // Container principal: tela cheia, fundo escuro, centraliza o conteúdo
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">

      {/* Card do formulário: largura máxima, fundo mais claro, cantos arredondados, sombra */}
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-lg space-y-6">

        {/* Cabeçalho */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Sentinel-safe</h2>
          <p className="mt-2 text-gray-400">Sistema de Monitoramento Unificado</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Input de Email */}
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            {/* Input de Senha */}
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Senha"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Mensagem de Erro */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Botão de Entrar */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;