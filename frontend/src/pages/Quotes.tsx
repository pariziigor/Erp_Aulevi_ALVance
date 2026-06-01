// frontend/src/pages/Quotes.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ArrowLeft, Plus, Trash2, Download, FileCheck, Loader2 } from 'lucide-react';

interface Client {
  id: string;
  razao_social: string;
  cnpj: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  unit: string;
}

interface QuoteItem {
  product_id: string;
  sku: string;
  name: string;
  quantity: number;
  price_unit: number;
}

export const Quotes: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Estados do Formulário de Orçamento
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [observations, setObservations] = useState('');

  // Novos Estados: Condição de Pagamento e Frete
  const [paymentCondition, setPaymentCondition] = useState('50_ENTRADA_50_ENTREGA');
  const [shippingType, setShippingType] = useState('FOB_RETIRADA');

  // Estados de Ação
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [clientsRes, productsRes] = await Promise.all([
          api.get('/clients'),
          api.get('/products')
        ]);
        setClients(clientsRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        console.error('Erro ao carregar dados para orçamentos', err);
        setErrorMessage('Falha ao sincronizar dados base da nuvem.');
      } finally {
        setLoadingData(false);
      }
    }
    loadInitialData();
  }, []);

  function handleAddItem() {
    if (!selectedProductId) return;
    
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const existingIndex = items.findIndex(item => item.product_id === product.id);
    if (existingIndex > -1) {
      const updatedItems = [...items];
      updatedItems[existingIndex].quantity += Number(quantityInput);
      setItems(updatedItems);
    } else {
      setItems([...items, {
        product_id: product.id,
        sku: product.sku,
        name: product.name,
        quantity: Number(quantityInput),
        price_unit: product.price
      }]);
    }

    setSelectedProductId('');
    setQuantityInput(1);
  }

  function handleRemoveItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  const totalBudget = items.reduce((acc, item) => acc + (item.quantity * item.price_unit), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  async function handleEmitirOrçamento(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedClientId) {
      setErrorMessage('Por favor, selecione um cliente corporativo válido.');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('O orçamento precisa conter pelo menos 1 insumo ou estrutura.');
      return;
    }

    setGeneratingPdf(true);

    const payload = {
      client_id: selectedClientId,
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      })),
      payment_condition: paymentCondition, // Injetado no payload
      shipping_type: shippingType,           // Injetado no payload
      observations: observations || 'Proposta comercial padrão válida por 10 dias.'
    };

    try {
      const response = await api.post('/quotes/generate', payload, { responseType: 'blob' });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const clientName = clients.find(c => c.id === selectedClientId)?.razao_social.toLowerCase().replace(/[^a-z0-9]/g, '_');
      link.setAttribute('download', `orcamento_aulevi_${clientName || 'nexus'}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccessMessage('Orçamento emitido e PDF gerado com sucesso!');
      setItems([]);
      setObservations('');
      setSelectedClientId('');
    } catch (err) {
      console.error(err);
      setErrorMessage('Erro técnico ao processar e compilar o PDF no motor do backend.');
    } finally {
      setGeneratingPdf(false);
    }
  }

  if (loadingData) {
    return <div className="text-xs font-mono uppercase text-center py-12">Carregando entidades e catálogos...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Sub-Header */}
      <div className="flex justify-between items-center border-b-2 border-black pb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-black uppercase tracking-wider hover:underline">
          <ArrowLeft size={16} /> Voltar ao Menu
        </button>
        <h2 className="text-2xl font-black uppercase tracking-tight">Painel de Engenharia de Orçamentos</h2>
      </div>

      {successMessage && (
        <div className="border-2 border-black bg-green-50 p-4 text-xs font-mono uppercase text-black flex items-center gap-2">
          <FileCheck size={16} className="text-green-600" /> [SUCESSO]: {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="border-2 border-black bg-red-50 p-4 text-xs font-mono uppercase text-black">
          [ALERTA]: {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LADO ESQUERDO: CONFIGURAÇÃO & INCLUSÃO */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider border-b-2 border-black pb-2">1. Entidade Cliente</h3>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Selecionar Cliente</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full border-2 border-black p-2 text-sm bg-white font-medium focus:outline-none uppercase"
              >
                <option value="">-- Selecione o Cliente --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.razao_social} ({c.cnpj})</option>
                ))}
              </select>
            </div>
          </div>

          {/* NOVO BLOCO BRUTALISTA: REGRAS COMERCIAIS */}
          <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider border-b-2 border-black pb-2">2. Regras de Fechamento</h3>
            
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Condição de Pagamento</label>
              <select
                value={paymentCondition}
                onChange={(e) => setPaymentCondition(e.target.value)}
                className="w-full border-2 border-black p-2 text-sm bg-white font-black uppercase focus:outline-none text-xs tracking-tight"
              >
                <option value="50_ENTRADA_50_ENTREGA">50% Entrada + 50% na Entrega das Estruturas</option>
                <option value="100_ANTECIPADO">100% Antecipado (Garante 5% de Desconto)</option>
                <option value="30_60_90_DIAS">Faturamento Direto (30 / 60 / 90 dias)</option>
                <option value="FINANCIAMENTO_BANCARIO">Via Financiamento Bancário / Construcard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Tipo de Frete / Logística</label>
              <select
                value={shippingType}
                onChange={(e) => setShippingType(e.target.value)}
                className="w-full border-2 border-black p-2 text-sm bg-white font-black uppercase focus:outline-none text-xs tracking-tight"
              >
                <option value="FOB_RETIRADA">FOB - Retirada por conta do Cliente (Fábrica Aulevi)</option>
                <option value="CIF_ENTREGA">CIF - Entrega Inclusa no Canteiro de Obras</option>
                <option value="A_COMBINAR">A Combinar / Logística Dedicada</option>
              </select>
            </div>
          </div>

          <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider border-b-2 border-black pb-2">3. Indexação de Itens</h3>
            
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Insumo / Estrutura</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full border-2 border-black p-2 text-sm bg-white font-medium focus:outline-none uppercase"
              >
                <option value="">-- Selecione o Produto --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>[{p.sku}] {p.name} - {formatCurrency(p.price)}/{p.unit}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Quantidade Demanda</label>
              <input
                type="number"
                min="1"
                value={quantityInput}
                onChange={(e) => setQuantityInput(Number(e.target.value))}
                className="w-full border-2 border-black p-2 text-sm focus:outline-none font-mono"
              />
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="w-full border-2 border-black bg-gray-200 p-2 text-xs font-black uppercase tracking-wider hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Inserir na Planilha
            </button>
          </div>
        </div>

        {/* LADO DIREITO: RESUMO DA PLANILHA & EMISSÃO */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between min-h-[400px]">
            <div>
              <h3 className="text-md font-black uppercase tracking-widest border-b-2 border-black pb-3 mb-4 flex items-center justify-between">
                <span>Composição Analítica do Orçamento</span>
                <span className="font-mono text-xs text-gray-500">ITENS: {items.length}</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-black text-xs font-black uppercase text-gray-600">
                      <th className="pb-2">SKU</th>
                      <th className="pb-2">Descrição</th>
                      <th className="pb-2 text-center">Qtd</th>
                      <th className="pb-2 text-right">Unitário</th>
                      <th className="pb-2 text-right">Subtotal</th>
                      <th className="pb-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-b text-sm font-medium">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center font-mono text-xs text-gray-400 uppercase">Nenhum insumo orçado até o momento.</td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-2 font-mono text-xs">{item.sku}</td>
                          <td className="py-2 uppercase font-bold text-xs">{item.name}</td>
                          <td className="py-2 text-center font-mono">{item.quantity}</td>
                          <td className="py-2 text-right font-mono text-xs">{formatCurrency(item.price_unit)}</td>
                          <td className="py-2 text-right font-mono text-xs font-bold">{formatCurrency(item.quantity * item.price_unit)}</td>
                          <td className="py-2 text-center">
                            <button onClick={() => handleRemoveItem(index)} className="text-black hover:text-red-600 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rodapé Interno com Totalizador e Notas */}
            <div className="border-t-2 border-black pt-4 mt-6 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1">Notas Gerais / Condições Comerciais</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Ex: Condições de pagamento: 50% de entrada + saldo na entrega dos perfis LSF."
                  className="w-full border-2 border-black p-2 text-xs focus:outline-none h-16 resize-none"
                />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-100 border-2 border-black p-4 gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-gray-600">Valor Total Estimado</div>
                  <div className="text-3xl font-black font-mono tracking-tight text-black">{formatCurrency(totalBudget)}</div>
                </div>
                
                <button
                  type="button"
                  onClick={handleEmitirOrçamento}
                  disabled={generatingPdf || items.length === 0}
                  className="w-full md:w-auto border-2 border-black bg-black text-white px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]"
                >
                  {generatingPdf ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Compilando PDF...
                    </>
                  ) : (
                    <>
                      <Download size={16} /> Compilar & Emitir Proposta PDF
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};