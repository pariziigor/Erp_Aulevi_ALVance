import { Loader2, Save, X } from 'lucide-react';
import type React from 'react';
import type { Client } from './types';

interface EditClientContactModalProps {
  client: Client;
  email: string;
  saving: boolean;
  telefone: string;
  whatsapp: string;
  onClose: () => void;
  onEmailChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onTelefoneChange: (value: string) => void;
  onWhatsappChange: (value: string) => void;
}

export function EditClientContactModal({
  client,
  email,
  saving,
  telefone,
  whatsapp,
  onClose,
  onEmailChange,
  onSubmit,
  onTelefoneChange,
  onWhatsappChange,
}: EditClientContactModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={onSubmit} className="nexus-panel w-full max-w-xl space-y-5 p-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">Editar Contato</h3>
            <p className="text-xs font-mono uppercase text-gray-500">{client.razao_social}</p>
          </div>
          <button type="button" onClick={onClose} className="nexus-secondary-button p-2">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase mb-2">E-mail</label>
            <input type="email" required value={email} onChange={(event) => onEmailChange(event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase mb-2">WhatsApp</label>
              <input type="text" required value={whatsapp} onChange={(event) => onWhatsappChange(event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-2">Telefone</label>
              <input type="text" value={telefone} onChange={(event) => onTelefoneChange(event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
            </div>
          </div>
        </div>
        <button disabled={saving} type="submit" className="nexus-primary-button w-full py-3">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Salvar Alteração
        </button>
      </form>
    </div>
  );
}
