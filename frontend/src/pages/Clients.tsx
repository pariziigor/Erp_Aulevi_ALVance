import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { ArrowLeft, Edit3, Filter, Loader2, Plus, Save, Search, X } from 'lucide-react';

interface Client {
  id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  cidade: string;
  uf: string;
  contato_nome: string;
  contato_email: string;
  contato_whatsapp: string;
  contato_telefone?: string;
}

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

  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [situacaoCadastral, setSituacaoCadastral] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [contatoNome, setContatoNome] = useState('');
  const [contatoEmail, setContatoEmail] = useState('');
  const [contatoWhatsapp, setContatoWhatsapp] = useState('');
  const [contatoTelefone, setContatoTelefone] = useState('');

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

  async function handleConsultarCNPJ() {
    const cnpjDigits = cnpj.replace(/\D/g, '');
    if (cnpjDigits.length !== 14) {
      setErrorForm('Digite um CNPJ valido com 14 digitos.');
      return;
    }
    setErrorForm(null);
    setLoadingCnpj(true);

    try {
      const response = await api.get(`/clients/cnpj/${cnpjDigits}`);
      const dados = response.data;
      setRazaoSocial(dados.razao_social || '');
      setNomeFantasia(dados.nome_fantasia || '');
      setSituacaoCadastral(dados.situacao_cadastral || '');
      setCep(dados.cep || '');
      setEndereco(dados.endereco || '');
      setNumero(dados.numero || '');
      setBairro(dados.bairro || '');
      setCidade(dados.cidade || '');
      setUf(dados.uf || '');
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : 'Erro ao consultar CNPJ.');
    } finally {
      setLoadingCnpj(false);
    }
  }

  function resetCreateForm() {
    setCnpj('');
    setRazaoSocial('');
    setNomeFantasia('');
    setSituacaoCadastral('');
    setCidade('');
    setUf('');
    setCep('');
    setEndereco('');
    setNumero('');
    setBairro('');
    setContatoNome('');
    setContatoEmail('');
    setContatoWhatsapp('');
    setContatoTelefone('');
  }

  async function handleSalvarCliente(e: React.FormEvent) {
    e.preventDefault();
    setErrorForm(null);
    setSuccessMessage(null);

    const payload = {
      cnpj,
      razao_social: razaoSocial,
      nome_fantasia: nomeFantasia,
      situacao_cadastral: situacaoCadastral,
      cep,
      endereco,
      numero,
      bairro,
      cidade,
      uf,
      contato_nome: contatoNome,
      contato_email: contatoEmail,
      contato_whatsapp: contatoWhatsapp,
      contato_telefone: contatoTelefone,
    };

    try {
      await api.post('/clients', payload);
      setShowForm(false);
      setSuccessMessage('Cliente cadastrado ou localizado na base compartilhada.');
      resetCreateForm();
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
      <div className="flex flex-col gap-4 border-b-2 border-black pb-4 md:flex-row md:items-center md:justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-black uppercase tracking-wider hover:underline">
          <ArrowLeft size={16} /> Voltar ao Menu
        </button>
        <h2 className="text-2xl font-black uppercase tracking-tight">Modulo CRM - Gestao de Clientes</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="border-2 border-black bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} /> {showForm ? 'Fechar Form' : 'Novo Cliente'}
        </button>
      </div>

      {errorForm && (
        <div className="border-2 border-black bg-red-50 p-4 text-xs font-mono uppercase text-black">
          [ERRO]: {errorForm}
        </div>
      )}

      {successMessage && (
        <div className="border-2 border-black bg-green-50 p-4 text-xs font-mono uppercase text-black">
          [OK]: {successMessage}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSalvarCliente} className="border-4 border-black bg-white p-6 md:p-8 space-y-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-black uppercase mb-2">CNPJ</label>
              <div className="flex gap-2">
                <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" placeholder="00000000000000" />
                <button type="button" onClick={handleConsultarCNPJ} disabled={loadingCnpj} className="border-2 border-black bg-gray-200 px-4 text-xs font-black uppercase hover:bg-black hover:text-white transition-all disabled:opacity-50">
                  {loadingCnpj ? <Loader2 size={16} className="animate-spin" /> : 'Buscar'}
                </button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase mb-2">Razao Social</label>
              <input type="text" required value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none bg-gray-50" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase mb-2">Nome Fantasia</label>
              <input type="text" value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-2">Situacao</label>
              <input type="text" value={situacaoCadastral} onChange={(e) => setSituacaoCadastral(e.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none bg-gray-50" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t-2 border-dashed border-gray-300 pt-4">
            <div className="col-span-2 md:col-span-2">
              <label className="block text-xs font-black uppercase mb-2">Endereco</label>
              <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-2">Numero</label>
              <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-2">Bairro</label>
              <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
            </div>
            <div className="col-span-2 md:col-span-2">
              <label className="block text-xs font-black uppercase mb-2">Cidade</label>
              <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-2">UF</label>
              <input type="text" value={uf} onChange={(e) => setUf(e.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-2">CEP</label>
              <input type="text" value={cep} onChange={(e) => setCep(e.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-t-2 border-dashed border-gray-300 pt-4">
            <div>
              <label className="block text-xs font-black uppercase mb-2">Nome do Contato</label>
              <input type="text" required value={contatoNome} onChange={(e) => setContatoNome(e.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" placeholder="Ex: Diretor de Compras" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-2">E-mail</label>
              <input type="email" required value={contatoEmail} onChange={(e) => setContatoEmail(e.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-2">WhatsApp</label>
              <input type="text" required value={contatoWhatsapp} onChange={(e) => setContatoWhatsapp(e.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" placeholder="11999999999" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-2">Telefone</label>
              <input type="text" value={contatoTelefone} onChange={(e) => setContatoTelefone(e.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" placeholder="Opcional" />
            </div>
          </div>

          <button type="submit" className="w-full border-2 border-black bg-black p-3 text-xs font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all">
            Efetivar Cadastro
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="relative md:col-span-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por CNPJ, razao social, cidade, contato, email ou WhatsApp..."
            className="w-full border-2 border-black p-2 pl-10 text-sm focus:outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={18} />
          <select
            value={ufFilter}
            onChange={(e) => setUfFilter(e.target.value)}
            className="w-full border-2 border-black p-2 pl-10 text-sm focus:outline-none bg-white appearance-none font-bold uppercase"
          >
            <option value="ALL">Todos os UFs</option>
            {availableUfs.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-xs font-mono uppercase text-center py-12">Sincronizando registros da nuvem...</div>
      ) : (
        <div className="border-2 border-black bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white text-xs font-black uppercase tracking-wider">
                <th className="p-3">CNPJ</th>
                <th className="p-3">Razao Social</th>
                <th className="p-3">Localizacao</th>
                <th className="p-3">Contato</th>
                <th className="p-3">E-mail</th>
                <th className="p-3">WhatsApp</th>
                <th className="p-3 w-20 text-center">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-sm">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center font-mono text-xs text-gray-500 uppercase">Nenhum cliente encontrado para os filtros.</td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-mono text-xs">{client.cnpj}</td>
                    <td className="p-3 font-bold uppercase">{client.razao_social}</td>
                    <td className="p-3 text-xs uppercase font-medium">{client.cidade} / {client.uf}</td>
                    <td className="p-3 text-xs">{client.contato_nome}</td>
                    <td className="p-3 text-xs">{client.contato_email}</td>
                    <td className="p-3 font-mono text-xs">{client.contato_whatsapp}</td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => openEditClient(client)}
                        className="inline-flex items-center justify-center border-2 border-black p-2 hover:bg-black hover:text-white transition-all"
                        title="Editar contato"
                      >
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleUpdateContact} className="w-full max-w-xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-5">
            <div className="flex items-start justify-between gap-4 border-b-2 border-black pb-3">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">Editar Contato</h3>
                <p className="text-xs font-mono uppercase text-gray-500">{editingClient.razao_social}</p>
              </div>
              <button type="button" onClick={() => setEditingClient(null)} className="border-2 border-black p-2 hover:bg-black hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase mb-2">E-mail</label>
                <input type="email" required value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase mb-2">WhatsApp</label>
                  <input type="text" required value={editWhatsapp} onChange={(e) => setEditWhatsapp(e.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase mb-2">Telefone</label>
                  <input type="text" value={editTelefone} onChange={(e) => setEditTelefone(e.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
                </div>
              </div>
            </div>
            <button disabled={savingEdit} type="submit" className="w-full border-2 border-black bg-black p-3 text-xs font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {savingEdit ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar Alteracao
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
