import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const isLight = theme === 'light';

    return (
        <div
            className={`w-16 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isLight ? 'bg-gray-300 justify-start' : 'bg-gray-700 justify-end'
                }`}
            onClick={toggleTheme}
            aria-label="Alternar tema"
        >
            <motion.div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${isLight ? 'bg-yellow-400' : 'bg-blue-500'
                    }`}
                layout // <-- A MÁGICA ACONTECE AQUI
                transition={{ type: 'spring', stiffness: 700, damping: 30 }} // Animação de "mola" para um efeito mais físico
            >
                {/* Usamos 'motion.div' aqui também para animar a troca de ícone com fade */}
                <motion.div
                    key={theme}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {isLight ? <Sun size={16} className="text-white" /> : <Moon size={16} className="text-white" />}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ThemeToggle;