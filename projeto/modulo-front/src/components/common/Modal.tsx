import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        // Backdrop
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            {/* Modal Panel */}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Body (onde o formulário irá) */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;