// frontend/src/components/common/AnimatedPage.tsx

import React from 'react';
import { motion } from 'framer-motion';

// Novas variantes para uma animação de "fade e slide-up"
const animations = {
    initial: { opacity: 0, y: 20 },   // Começa invisível e 20px abaixo
    animate: { opacity: 1, y: 0 },     // Anima para visível e na posição original
    exit: { opacity: 0, y: -20 },    // Sai para cima e se torna invisível
};

interface AnimatedPageProps {
    children: React.ReactNode;
}

const AnimatedPage: React.FC<AnimatedPageProps> = ({ children }) => {
    return (
        <motion.div
            variants={animations}
            initial="initial"
            animate="animate"
            exit="exit"
            // Aumentamos um pouco a duração para uma sensação mais suave
            transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedPage;