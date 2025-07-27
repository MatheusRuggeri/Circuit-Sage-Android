import React, { useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void; // Still needed for explicit close actions like Escape key or close button (if added)
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      // Trigger animation slightly after isOpen becomes true
      const timer = setTimeout(() => setShowContent(true), 10); // Small delay to allow initial render
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    } else {
      setShowContent(false); // Reset for next open
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <View
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 transition-opacity duration-200 ease-out"
      style={{ opacity: showContent ? 1 : 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      // onClick={onClose} // Removed: backdrop click no longer closes modal
    >
      <View
        className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md transition-all duration-1000 ease-out"
        style={{
          transform: showContent ? 'scale(1)' : 'scale(0.85)',
          opacity: showContent ? 1 : 0,
        }}
        onClick={(e) => e.stopPropagation()} // Prevent click events from bubbling to the backdrop
      >
        {title && (
          <Text
            id="modal-title"
            className="text-2xl md:text-3xl font-bold text-sky-400 mb-4 text-center"
            style={{fontFamily: "'Orbitron', sans-serif"}}
          >
            {title}
          </Text>
        )}
        {children}
      </View>
    </View>
  );
};

export default Modal;