import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  showBackdrop?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  showBackdrop = true,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      {showBackdrop && (
        <div
          className="modal-backdrop-in fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        ></div>
      )}

      {/* Modal */}
      <div
        className="modal-slide-up pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          className={`
            pointer-events-auto
            w-full max-w-lg
            rounded-2xl border border-slate-200
            bg-white/95 shadow-2xl
            backdrop-blur-xl
            overflow-hidden
            ${className}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  position?: 'left' | 'right';
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  className = '',
}: DrawerProps) {
  if (!isOpen) return null;

  const positionClasses = {
    left: 'left-0 animate-drawer-in-left',
    right: 'right-0 animate-drawer-in-right',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop-in fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div
        className={`
          fixed top-0 bottom-0 w-full max-w-md
          ${positionClasses[position]}
          bg-white/95 shadow-2xl backdrop-blur-xl
          z-50 overflow-y-auto
          border-l border-slate-200
          ${className}
        `}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white/95 backdrop-blur">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </>
  );
}
