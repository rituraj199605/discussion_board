// src/components/common/Modal.tsx
import React, { useEffect, useRef } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import Button from './Button';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';
type ModalType = 'default' | 'alert' | 'confirm' | 'info' | 'success' | 'error';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: ModalSize;
  type?: ModalType;
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  type = 'default',
  showCloseButton = true,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  footer
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto'; // Restore scrolling
    };
  }, [isOpen, closeOnEscape, onClose]);
  
  // Handle click outside modal
  const handleOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };
  
  // Icon for type
  const ModalIcon = () => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="text-yellow-500" size={24} />;
      case 'confirm':
        return <AlertCircle className="text-blue-500" size={24} />;
      case 'info':
        return <Info className="text-mint-500" size={24} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'error':
        return <AlertTriangle className="text-red-500" size={24} />;
      default:
        return null;
    }
  };
  
  // Type-specific header class
  const getHeaderClass = () => {
    switch (type) {
      case 'alert':
        return 'bg-yellow-50 border-b border-yellow-100';
      case 'confirm':
        return 'bg-blue-50 border-b border-blue-100';
      case 'info':
        return 'bg-mint-50 border-b border-mint-100';
      case 'success':
        return 'bg-green-50 border-b border-green-100';
      case 'error':
        return 'bg-red-50 border-b border-red-100';
      default:
        return 'border-b border-slate-200';
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleOutsideClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} opacity-0 translate-y-4 transition-transform duration-300 transform-gpu ease-out animate-modal-appear`}
      >
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between rounded-t-lg ${getHeaderClass()}`}>
          <div className="flex items-center gap-3">
            {ModalIcon()}
            {title && (
              <h3 
                id="modal-title" 
                className="text-lg font-medium text-slate-800"
              >
                {title}
              </h3>
            )}
          </div>
          
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        {/* Content */}
        <div className="px-6 py-4">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-lg flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Pre-defined modal types for common use cases
export const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type={isDangerous ? 'error' : 'confirm'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {cancelText}
          </Button>
          <Button 
            variant={isDangerous ? 'danger' : 'primary'} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-slate-600">{message}</p>
    </Modal>
  );
};

export const AlertModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'alert';
  buttonText?: string;
}> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type={type}
      footer={
        <Button variant="primary" onClick={onClose}>
          {buttonText}
        </Button>
      }
    >
      <p className="text-slate-600">{message}</p>
    </Modal>
  );
};

export default Modal;