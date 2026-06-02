import type { SystemUser } from './types';

interface UsersTableProps {
  loading: boolean;
  updatingUserId: string | null;
  users: SystemUser[];
  onUpdateUser: (user: SystemUser, payload: Partial<Pick<SystemUser, 'role' | 'is_active'>>) => void;
}

export function UsersTable({ loading, updatingUserId, users, onUpdateUser }: UsersTableProps) {
  return (
    <div className="nexus-table-wrap">
      <table className="w-full text-left">
        <thead>
          <tr className="nexus-table-head">
            <th className="p-3">Usuário</th>
            <th className="p-3 w-40">Permissão</th>
            <th className="p-3 w-32">Status</th>
            <th className="p-3 w-44 text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm">
          {loading ? (
            <tr>
              <td colSpan={4} className="p-4 text-center font-mono text-xs uppercase text-gray-500">Carregando usuários...</td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-4 text-center font-mono text-xs uppercase text-gray-500">Nenhum usuário cadastrado.</td>
            </tr>
          ) : (
            users.map((systemUser) => (
              <tr key={systemUser.id} className="transition hover:bg-orange-50/50">
                <td className="p-3">
                  <div className="font-bold uppercase">{systemUser.name}</div>
                  <div className="font-mono text-xs text-gray-500">{systemUser.email}</div>
                </td>
                <td className="p-3">
                  <select
                    value={systemUser.role}
                    disabled={updatingUserId === systemUser.id}
                    onChange={(event) => onUpdateUser(systemUser, { role: event.target.value as SystemUser['role'] })}
                    className="w-full border-2 border-black p-2 text-xs bg-white font-black uppercase focus:outline-none disabled:opacity-50"
                  >
                    <option value="SELLER">Vendedor</option>
                    <option value="ADM">Administrador</option>
                  </select>
                </td>
                <td className="p-3">
                  <span className={`rounded-full border px-2 py-1 text-xs font-bold uppercase ${systemUser.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                    {systemUser.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button
                    disabled={updatingUserId === systemUser.id}
                    type="button"
                    onClick={() => onUpdateUser(systemUser, { is_active: !systemUser.is_active })}
                    className="nexus-secondary-button px-3 py-2"
                  >
                    {systemUser.is_active ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
