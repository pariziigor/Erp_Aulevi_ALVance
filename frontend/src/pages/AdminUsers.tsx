import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { ResetPasswordModal } from '../components/admin-users/ResetPasswordModal';
import { UserCreateForm } from '../components/admin-users/UserCreateForm';
import { UserRecommendations } from '../components/admin-users/UserRecommendations';
import { UsersTable } from '../components/admin-users/UsersTable';
import { useToast } from '../components/shared/Toast';
import type { SystemUser } from '../components/admin-users/types';
import api from '../services/api';

export const AdminUsers: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { addToast } = useToast();
  const [usersList, setUsersList] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [resettingUser, setResettingUser] = useState<SystemUser | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<SystemUser['role']>('SELLER');

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/auth/users');
      setUsersList(response.data);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao carregar usuarios.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  async function handleCreateUser(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    try {
      await api.post('/auth/users', {
        name,
        email,
        password,
        role,
      });
      setName('');
      setEmail('');
      setPassword('');
      setRole('SELLER');
      addToast('Usuario criado com senha temporaria. A troca sera exigida no primeiro acesso.', 'success');
      fetchUsers();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao criar usuario.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateUser(user: SystemUser, payload: Partial<Pick<SystemUser, 'role' | 'is_active'>>) {
    setUpdatingUserId(user.id);

    try {
      await api.patch(`/auth/users/${user.id}`, payload);
      addToast('Permissao do usuario atualizada e registrada no log de auditoria.', 'success');
      fetchUsers();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao atualizar usuario.', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function handleResetPassword(event: React.FormEvent) {
    event.preventDefault();
    if (!resettingUser) return;

    setUpdatingUserId(resettingUser.id);

    try {
      await api.post(`/auth/users/${resettingUser.id}/password/reset`, {
        temporary_password: temporaryPassword,
      });
      addToast('Senha temporaria redefinida. O usuario devera troca-la no proximo acesso.', 'success');
      setResettingUser(null);
      setTemporaryPassword('');
      fetchUsers();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao redefinir senha.', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="nexus-page-header">
        <button onClick={onBack} className="nexus-back-button">
          <ArrowLeft size={16} /> Voltar ao menu
        </button>
        <h2 className="nexus-title">Administração de Usuários</h2>
        <div className="nexus-badge">
          <Shield size={14} /> Acesso ADM
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <UserCreateForm
          email={email}
          name={name}
          password={password}
          role={role}
          saving={saving}
          onEmailChange={setEmail}
          onNameChange={setName}
          onPasswordChange={setPassword}
          onRoleChange={setRole}
          onSubmit={handleCreateUser}
        />

        <div className="space-y-6 lg:col-span-2">
          <UsersTable
            loading={loading}
            updatingUserId={updatingUserId}
            users={usersList}
            onResetPassword={(user) => {
              setResettingUser(user);
              setTemporaryPassword('');
            }}
            onUpdateUser={handleUpdateUser}
          />
          <UserRecommendations />
        </div>
      </div>

      {resettingUser && (
        <ResetPasswordModal
          saving={updatingUserId === resettingUser.id}
          temporaryPassword={temporaryPassword}
          user={resettingUser}
          onClose={() => setResettingUser(null)}
          onPasswordChange={setTemporaryPassword}
          onSubmit={handleResetPassword}
        />
      )}
    </div>
  );
};
