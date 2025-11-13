import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react'; // 👈 1. Importe os ícones

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    // 👇 2. Adicione estados para controlar a visibilidade de cada campo de senha
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('As senhas não coincidem.');
            return;
        }

        setLoading(true);

        const registerPromise = api.post('/users', {
            name: formData.name,
            email: formData.email,
            password: formData.password,
        });

        toast.promise(
            registerPromise,
            {
                loading: 'Cadastrando sua conta...',
                success: 'Cadastro realizado com sucesso!',
                error: (err) => err.response?.data?.error || 'Ocorreu uma falha no cadastro.',
            }
        )
            .then(() => {
                setTimeout(() => {
                    navigate('/login');
                }, 1200);
            })
            .catch(() => { })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
            <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-lg space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white">Criar Conta</h2>
                    <p className="mt-2 text-gray-400">Junte-se ao Sentinel-safe</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <input id="name" name="name" type="text" required placeholder="Nome completo" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input id="email" name="email" type="email" required placeholder="Email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />

                        {/* 👇 3. Campo "Senha" com o ícone de olho 👇 */}
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                placeholder="Senha"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* 👇 4. Campo "Confirme a Senha" com o ícone de olho 👇 */}
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                placeholder="Confirme a Senha"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200">
                            {loading ? 'Aguarde...' : 'Cadastrar'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-400">
                        Já tem uma conta?{' '}
                        <Link to="/login" className="font-medium text-blue-500 hover:text-blue-400 transition-colors duration-200">
                            Faça o login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;