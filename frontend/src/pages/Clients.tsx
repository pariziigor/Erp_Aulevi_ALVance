import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { ArrowLeft, Plus } from 'lucide-react';
import { ClientCreateForm } from '../components/clients/ClientCreateForm';
import { ClientFilters } from '../components/clients/ClientFilters';
import { ClientsTable } from '../components/clients/ClientsTable';
import { EditClientContactModal } from '../components/clients/EditClientContactModal';
import type { Client, ClientFormState } from '../components/clients/types';

const emptyClientForm: ClientFormState = {
  cnpj: '',
  razaoSocial: '',
  nomeFantasia: '',
  situacaoCadastral: '',
  cidade: '',
  uf: '',
  cep: '',
  endereco: '',
  numero: '',
  bairro: '',
  contatoNome: '',
  contatoEmail: '',
  contatoWhatsapp: '',
  contatoTelefone: '',
};

export const Clients: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [ufFilter, setUfFilter] = useState('ALL');

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [form, setForm] = useState<ClientFormState>(emptyClientForm);
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (err) {
      console.error('Erro ao buscar clientes', err);
    } finally {
      setLoading(false);
    }
  }

  const availableUfs = useMemo(() => {
    return Array.from(new Set(clients.map((client) => client.uf).filter(Boolean))).sort();
  }, [clients]);

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    return clients.filter((client) => {
      const matchesSearch = !term || [
        client.cnpj,
        client.razao_social,
        client.nome_fantasia,
        client.cidade,
        client.contato_nome,
        client.contato_email,
        client.contato_whatsapp,
      ].some((value) => String(value || '').toLowerCase().includes(term));
      const matchesUf = ufFilter === 'ALL' || client.uf === ufFilter;
      return matchesSearch && matchesUf;
    });
  }, [clients, search, ufFilter]);

  function updateFormField(field: keyof ClientFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleConsultarCNPJ() {
    const cnpjDigits = form.cnpj.replace(/\D/g, '');
    if (cnpjDigits.length !== 14) {
      setErrorForm('Digite um CNPJ válido com 14 dígitos.');
      return;
    }
    setErrorForm(null);
    setLoadingCnpj(true);

    try {
      const response = await api.get(`/clients/cnpj/${cnpjDigits}`);
      const dados = response.data;
      setForm((current) => ({
        ...current,
        razaoSocial: dados.razao_social || '',
        nomeFantasia: dados.nome_fantasia || '',
        situacaoCadastral: dados.situacao_cadastral || '',
        cep: dados.cep || '',
        endereco: dados.endereco || '',
        numero: dados.numero || '',
        bairro: dados.bairro || '',
        cidade: dados.cidade || '',
        uf: dados.uf || '',
      }));
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : 'Erro ao consultar CNPJ.');
    } finally {
      setLoadingCnpj(false);
    }
  }

  async function handleSalvarCliente(e: React.FormEvent) {
    e.preventDefault();
    setErrorForm(null);
    setSuccessMessage(null);

    const payload = {
      cnpj: form.cnpj,
      razao_social: form.razaoSocial,
      nome_fantasia: form.nomeFantasia,
      situacao_cadastral: form.situacaoCadastral,
      cep: form.cep,
      endereco: form.endereco,
      numero: form.numero,
      bairro: form.bairro,
      cidade: form.cidade,
      uf: form.uf,
      contato_nome: form.contatoNome,
      contato_email: form.contatoEmail,
      contato_whatsapp: form.contatoWhatsapp,
      contato_telefone: form.contatoTelefone,
    };

    try {
      await api.post('/clients', payload);
      setShowForm(false);
      setSuccessMessage('Cliente cadastrado ou localizado na base compartilhada.');
      setForm(emptyClientForm);
      fetchClients();
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : 'Erro ao salvar cliente.');
    }
  }

  function openEditClient(client: Client) {
    setEditingClient(client);
    setEditEmail(client.contato_email || '');
    setEditWhatsapp(client.contato_whatsapp || '');
    setEditTelefone(client.contato_telefone || '');
    setErrorForm(null);
    setSuccessMessage(null);
  }

  async function handleUpdateContact(e: React.FormEvent) {
    e.preventDefault();
    if (!editingClient) return;

    setSavingEdit(true);
    setErrorForm(null);
    setSuccessMessage(null);

    try {
      await api.patch(`/clients/${editingClient.id}/contact`, {
        contato_email: editEmail,
        contato_whatsapp: editWhatsapp,
        contato_telefone: editTelefone,
      });
      setEditingClient(null);
      setSuccessMessage('Contato do cliente atualizado e registrado no log de auditoria.');
      fetchClients();
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : 'Erro ao atualizar contato.');
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="nexus-page-header">
        <button onClick={onBack} className="nexus-back-button">
          <ArrowLeft size={16} /> Voltar ao menu
        </button>
        <h2 className="nexus-title">Módulo CRM - Gestão de Clientes</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className={showForm ? 'nexus-secondary-button' : 'nexus-primary-button'}
        >
          <Plus size={16} /> {showForm ? 'Fechar Form' : 'Novo Cliente'}
        </button>
      </div>

      {errorForm && (
        <div className="nexus-alert-error">
          [ERRO]: {errorForm}
        </div>
      )}

      {successMessage && (
        <div className="nexus-alert-success">
          [OK]: {successMessage}
        </div>
      )}

      {showForm && (
        <ClientCreateForm
          form={form}
          loadingCnpj={loadingCnpj}
          onChange={updateFormField}
          onSearchCnpj={handleConsultarCNPJ}
          onSubmit={handleSalvarCliente}
        />
      )}

      <ClientFilters
        availableUfs={availableUfs}
        search={search}
        ufFilter={ufFilter}
        onSearchChange={setSearch}
        onUfFilterChange={setUfFilter}
      />

      <ClientsTable clients={filteredClients} loading={loading} onEditClient={openEditClient} />

      {editingClient && (
        <EditClientContactModal
          client={editingClient}
          email={editEmail}
          saving={savingEdit}
          telefone={editTelefone}
          whatsapp={editWhatsapp}
          onClose={() => setEditingClient(null)}
          onEmailChange={setEditEmail}
          onSubmit={handleUpdateContact}
          onTelefoneChange={setEditTelefone}
          onWhatsappChange={setEditWhatsapp}
        />
      )}
    </div>
  );
};
