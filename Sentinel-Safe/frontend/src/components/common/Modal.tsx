import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}
const overlayVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
};

const modalVariants = {
    hidden: { y: "-30px", opacity: 0, scale: 0.95 },
    visible: { y: "0", opacity: 1, scale: 1 },
    exit: { y: "30px", opacity: 0, scale: 0.95 },
};

function Modal({ isOpen, onClose, title, children }: ModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                // Overlay (fundo)
                <motion.div
                    // CORREÇÃO: Adicionado backdrop-blur para um efeito mais moderno
                    className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={onClose}
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                    {/* Contêiner do Modal */}
                    <motion.div
                        // Adicionadas classes para modo claro (bg-white) e escuro (dark:bg-gray-800)
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4"
                        onClick={(e) => e.stopPropagation()}
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        {/* Cabeçalho do Modal */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-white transition-colors"
                                aria-label="Fechar modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Corpo do Modal */}
                        <div className="p-6">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default Modal;