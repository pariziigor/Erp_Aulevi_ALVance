import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ArrowLeft, Shield } from 'lucide-react';
import { UserCreateForm } from '../components/admin-users/UserCreateForm';
import { UserRecommendations } from '../components/admin-users/UserRecommendations';
import { UsersTable } from '../components/admin-users/UsersTable';
import type { SystemUser } from '../components/admin-users/types';

export const AdminUsers: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [usersList, setUsersList] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
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
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
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
      setMessage('Usuário criado com sucesso e registrado no log de auditoria.');
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário.');
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
      setMessage('Permissão do usuário atualizada e registrada no log de auditoria.');
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário.');
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

      {error && (
        <div className="nexus-alert-error">
          [ERRO]: {error}
        </div>
      )}

      {message && (
        <div className="nexus-alert-success">
          [OK]: {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

        <div className="lg:col-span-2 space-y-6">
          <UsersTable
            loading={loading}
            updatingUserId={updatingUserId}
            users={usersList}
            onUpdateUser={handleUpdateUser}
          />
          <UserRecommendations />
        </div>
      </div>
    </div>
  );
};
