// frontend/src/pages/Clients.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, ArrowLeft, Loader2 } from 'lucide-react';

interface Client {
  id: string;
  cnpj: string;
  razao_social: string;
  cidade: string;
  uf: string;
  contato_nome: string;
  contato_whatsapp: string;
}

export const Clients: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Estados do Formulário
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [contatoNome, setContatoNome] = useState('');
  const [contatoEmail, setContatoEmail] = useState('');
  const [contatoWhatsapp, setContatoWhatsapp] = useState('');
  
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // Carrega clientes ao entrar na tela
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

  // O Botão Mágico: Consulta CNPJ na API do nosso Backend (que bate na BrasilAPI)
  async function handleConsultarCNPJ() {
    if (!cnpj || cnpj.length < 14) {
      setErrorForm('Digite um CNPJ válido com 14 dígitos.');
      return;
    }
    setErrorForm(null);
    setLoadingCnpj(true);

    try {
      const response = await api.get(`/clients/cnpj/${cnpj}`);
      const dados = response.data;
      
      setRazaoSocial(dados.razao_social || '');
      setNomeFantasia(dados.nome_fantasia || '');
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

  // Salva o cliente de fato no Supabase
  async function handleSalvarCliente(e: React.FormEvent) {
    e.preventDefault();
    setErrorForm(null);

    const payload = {
      cnpj,
      razao_social: razaoSocial,
      nome_fantasia: nomeFantasia,
      cep,
      endereco,
      numero,
      bairro,
      cidade,
      uf,
      contato_nome: contatoNome,
      contato_email: contatoEmail,
      contato_whatsapp: contatoWhatsapp,
    };

    try {
      await api.post('/clients', payload);
      setShowForm(false);
      fetchClients(); // Atualiza a tabela
      // Limpa formulário
      setCnpj(''); setRazaoSocial(''); setCidade(''); setUf(''); setContatoNome(''); setContatoWhatsapp('');
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : 'Erro ao salvar cliente.');
    }
  }

  return (
    <div className="space-y-8">
      {/* Sub-Header Navegação */}
      <div className="flex justify-between items-center border-b-2 border-black pb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-black uppercase tracking-wider hover:underline">
          <ArrowLeft size={16} /> Voltar ao Menu
        </button>
        <h2 className="text-2xl font-black uppercase tracking-tight">Módulo CRM — Gestão de Clientes</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="border-2 border-black bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-white hover:text-black transition-all flex items-center gap-2"
        >
          <Plus size={16} /> {showForm ? 'Fechar Form' : 'Novo Cliente'}
        </button>
      </div>

      {errorForm && (
        <div className="border-2 border-black bg-red-50 p-4 text-xs font-mono uppercase text-black">
          [ERRO]: {errorForm}
        </div>
      )}

      {/* FORMULÁRIO DE CADASTRO (BRUTALISTA) */}
      {showForm && (
        <form onSubmit={handleSalvarCliente} className="border-4 border-black bg-white p-6 md:p-8 space-y-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Campo CNPJ + Consulta */}
            <div>
              <label className="block text-xs font-black uppercase mb-2">CNPJ (Apenas números)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="w-full border-2 border-black p-2 text-sm focus:outline-none"
                  placeholder="00000000000000"
                />
                <button
                  type="button"
                  onClick={handleConsultarCNPJ}
                  disabled={loadingCnpj}
                  className="border-2 border-black bg-gray-200 px-4 text-xs font-black uppercase hover:bg-black hover:text-white transition-all disabled:opacity-50"
                >
                  {loadingCnpj ? <Loader2 size={16} className="animate-spin" /> : 'Buscar'}
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase mb-2">Razão Social</label>
              <input
                type="text"
                required
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                className="w-full border-2 border-black p-2 text-sm focus:outline-none bg-gray-50"
              />
            </div>
          </div>

          {/* Endereço Bloco */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t-2 border-dashed border-gray-300 pt-4">
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

          {/* Contato Focado no Vendedor */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t-2 border-dashed border-gray-300 pt-4">
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
          </div>

          <button
            type="submit"
            className="w-full border-2 border-black bg-black p-3 text-xs font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all"
          >
            EFETIVAR CADASTRO NO SUPABASE
          </button>
        </form>
      )}

      {/* TABELA DE LISTAGEM */}
      {loading ? (
        <div className="text-xs font-mono uppercase text-center py-12">Sincronizando registros da nuvem...</div>
      ) : (
        <div className="border-2 border-black bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white text-xs font-black uppercase tracking-wider">
                <th className="p-3">CNPJ</th>
                <th className="p-3">Razão Social</th>
                <th className="p-3">Localização</th>
                <th className="p-3">Contato Responsável</th>
                <th className="p-3">WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-sm">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center font-mono text-xs text-gray-500 uppercase">Nenhum cliente corporativo indexado.</td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-mono text-xs">{client.cnpj}</td>
                    <td className="p-3 font-bold uppercase">{client.razao_social}</td>
                    <td className="p-3 text-xs uppercase font-medium">{client.cidade} / {client.uf}</td>
                    <td className="p-3 text-xs">{client.contato_nome}</td>
                    <td className="p-3 font-mono text-xs">{client.contato_whatsapp}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};