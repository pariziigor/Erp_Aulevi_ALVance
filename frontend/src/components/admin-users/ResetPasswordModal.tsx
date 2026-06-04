import { Check, Copy, Loader2, RefreshCw, Save, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { PasswordInput } from '../shared/PasswordInput';
import type { SystemUser } from './types';

interface ResetPasswordModalProps {
  saving: boolean;
  temporaryPassword: string;
  user: SystemUser;
  onClose: () => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

function generateTemporaryPassword(length = 10) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);
  return Array.from(randomValues, (value) => alphabet[value % alphabet.length]).join('');
}

export function ResetPasswordModal({
  saving,
  temporaryPassword,
  user,
  onClose,
  onPasswordChange,
  onSubmit,
}: ResetPasswordModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!temporaryPassword) {
      onPasswordChange(generateTemporaryPassword());
    }
  }, [onPasswordChange, temporaryPassword]);

  function handleGeneratePassword() {
    setCopied(false);
    onPasswordChange(generateTemporaryPassword());
  }

  async function handleCopyPassword() {
    if (!temporaryPassword) return;
    await navigator.clipboard.writeText(temporaryPassword);
    setCopied(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl border border-white/60 bg-white p-6 shadow-2xl shadow-slate-900/20">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold uppercase text-slate-950">Redefinir senha</h3>
            <p className="mt-1 text-xs font-semibold uppercase text-slate-500">{user.name} / {user.email}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-orange-300 hover:text-orange-600">
            <X size={16} />
          </button>
        </div>

        <label className="mb-2 block text-xs font-bold uppercase text-slate-600">Nova senha temporária</label>
        <PasswordInput value={temporaryPassword} onChange={onPasswordChange} minLength={6} />

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button type="button" onClick={handleGeneratePassword} className="nexus-secondary-button justify-center px-3 py-2">
            <RefreshCw size={16} /> Gerar senha
          </button>
          <button type="button" onClick={handleCopyPassword} className="nexus-secondary-button justify-center px-3 py-2">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copiada' : 'Copiar senha'}
          </button>
        </div>

        <p className="mt-3 text-xs font-medium text-slate-500">
          Envie essa senha temporária ao usuário. Após entrar com ela, ele será obrigado a definir uma senha pessoal.
        </p>

        <button disabled={saving} type="submit" className="nexus-primary-button mt-5 w-full py-3">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Salvar senha temporária
        </button>
      </form>
    </div>
  );
}

