import React, { useState } from 'react';
import { KeyRound, ShieldAlert } from 'lucide-react';
import { LoadingButton } from '../components/shared/FormComponents';
import { PasswordInput } from '../components/shared/PasswordInput';
import { useAuth } from '../context/useAuth';

export const ChangePassword: React.FC = () => {
  const { changePassword, logout, user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('A confirmação da nova senha não confere.');
      return;
    }

    if (newPassword.length < 8) {
      setError('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/75 p-7 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/25">
            <KeyRound size={22} />
          </div>
          <h1 className="text-2xl font-extrabold uppercase text-slate-950">Definir senha pessoal</h1>
          <p className="mt-2 text-xs font-semibold uppercase text-slate-500">
            Primeiro acesso de {user?.name}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 font-medium text-red-700">
            <ShieldAlert size={20} className="mt-0.5 shrink-0" />
            <span className="text-xs font-semibold uppercase">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-600">Senha padrão recebida</label>
            <PasswordInput value={currentPassword} onChange={setCurrentPassword} />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-600">Nova senha pessoal</label>
            <PasswordInput value={newPassword} onChange={setNewPassword} minLength={8} />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-600">Confirmar nova senha</label>
            <PasswordInput value={confirmPassword} onChange={setConfirmPassword} minLength={8} />
          </div>

          <LoadingButton
            type="submit"
            isLoading={isSubmitting}
            loadingText="Alterando senha..."
            className="w-full rounded-2xl p-4 text-sm font-extrabold uppercase shadow-xl shadow-orange-500/20 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-orange-500/25"
          >
            Salvar senha pessoal
          </LoadingButton>
        </form>

        <button
          type="button"
          onClick={logout}
          className="mt-5 w-full text-center text-xs font-bold uppercase text-slate-500 transition hover:text-orange-600"
        >
          Sair e alterar depois
        </button>
      </div>
    </div>
  );
};
