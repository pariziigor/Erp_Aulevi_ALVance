import React, { useEffect, useState } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { ResetPasswordModal } from '../components/admin-users/ResetPasswordModal';
import { UserCreateForm } from '../components/admin-users/UserCreateForm';
import { UserRecommendations } from '../components/admin-users/UserRecommendations';
import { UsersTable } from '../components/admin-users/UsersTable';
import type { SystemUser } from '../components/admin-users/types';
import api from '../services/api';

export const AdminUsers: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [usersList, setUsersList] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [resettingUser, setResettingUser] = useState<SystemUser | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<SystemUser['role']>('SELLER');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const response = await api.get('/auth/users');
      setUsersList(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuarios.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

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
      setMessage('Usuario criado com senha temporaria. A troca sera exigida no primeiro acesso.');
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuario.');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateUser(user: SystemUser, payload: Partial<Pick<SystemUser, 'role' | 'is_active'>>) {
    setUpdatingUserId(user.id);
    setError(null);
    setMessage(null);

    try {
      await api.patch(`/auth/users/${user.id}`, payload);
      setMessage('Permissao do usuario atualizada e registrada no log de auditoria.');
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuario.');
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function handleResetPassword(event: React.FormEvent) {
    event.preventDefault();
    if (!resettingUser) return;

    setUpdatingUserId(resettingUser.id);
    setError(null);
    setMessage(null);

    try {
      await api.post(`/auth/users/${resettingUser.id}/password/reset`, {
        temporary_password: temporaryPassword,
      });
      setMessage('Senha temporaria redefinida. O usuario devera troca-la no proximo acesso.');
      setResettingUser(null);
      setTemporaryPassword('');
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha.');
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

      {error && <div className="nexus-alert-error">[ERRO]: {error}</div>}
      {message && <div className="nexus-alert-success">[OK]: {message}</div>}

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

