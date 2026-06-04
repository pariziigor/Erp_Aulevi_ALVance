import { Check, Copy, RefreshCw } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { LoadingButton } from '../shared/FormComponents';
import { Modal } from '../shared/Modal';
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
    <Modal isOpen onClose={onClose} title="Redefinir senha" className="max-w-md">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="rounded-xl border border-orange-100 bg-orange-50/70 p-3">
          <p className="text-xs font-bold uppercase text-orange-700">{user.name}</p>
          <p className="mt-1 font-mono text-xs text-slate-600">{user.email}</p>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase text-slate-600">Nova senha temporária</label>
          <PasswordInput value={temporaryPassword} onChange={onPasswordChange} minLength={6} />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button type="button" onClick={handleGeneratePassword} className="nexus-secondary-button justify-center px-3 py-2">
            <RefreshCw size={16} /> Gerar senha
          </button>
          <button type="button" onClick={handleCopyPassword} className="nexus-secondary-button justify-center px-3 py-2">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copiada' : 'Copiar senha'}
          </button>
        </div>

        <p className="text-xs font-medium text-slate-500">
          Envie essa senha temporária ao usuário. Após entrar com ela, ele será obrigado a definir uma senha pessoal.
        </p>

        <LoadingButton isLoading={saving} loadingText="Salvando senha..." type="submit" className="w-full py-3">
          Salvar senha temporária
        </LoadingButton>
      </form>
    </Modal>
  );
}

