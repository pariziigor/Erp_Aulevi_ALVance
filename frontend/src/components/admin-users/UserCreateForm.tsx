import { Loader2, Save, UserPlus } from 'lucide-react';
import type React from 'react';
import { PasswordInput } from '../shared/PasswordInput';
import type { SystemUser } from './types';

interface UserCreateFormProps {
  email: string;
  name: string;
  password: string;
  role: SystemUser['role'];
  saving: boolean;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRoleChange: (value: SystemUser['role']) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export function UserCreateForm({
  email,
  name,
  password,
  role,
  saving,
  onEmailChange,
  onNameChange,
  onPasswordChange,
  onRoleChange,
  onSubmit,
}: UserCreateFormProps) {
  return (
    <form onSubmit={onSubmit} className="nexus-panel space-y-5 lg:col-span-1">
      <h3 className="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-extrabold uppercase text-slate-900">
        <UserPlus size={16} /> Novo Usuário
      </h3>
      <div>
        <label className="block text-xs font-black uppercase mb-2">Nome</label>
        <input required value={name} onChange={(event) => onNameChange(event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-black uppercase mb-2">E-mail</label>
        <input required type="email" value={email} onChange={(event) => onEmailChange(event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-black uppercase mb-2">Senha Temporaria</label>
        <PasswordInput
          value={password}
          onChange={onPasswordChange}
          minLength={6}
          className="rounded-none border-2 border-black bg-white p-2 pl-11 text-sm focus:ring-0"
        />
      </div>
      <div>
        <label className="block text-xs font-black uppercase mb-2">Nível de Permissão</label>
        <select value={role} onChange={(event) => onRoleChange(event.target.value as SystemUser['role'])} className="w-full border-2 border-black p-2 text-sm bg-white font-black uppercase focus:outline-none">
          <option value="SELLER">Vendedor</option>
          <option value="ADM">Administrador</option>
        </select>
      </div>
      <button disabled={saving} type="submit" className="nexus-primary-button w-full py-3">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Criar Acesso
      </button>
    </form>
  );
}
