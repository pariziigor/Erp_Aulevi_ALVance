import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { ArrowLeft } from 'lucide-react';
import { SellerQuoteCards } from '../components/seller/SellerQuoteCards';
import { SellerQuoteDetailsModal } from '../components/seller/SellerQuoteDetailsModal';
import { SellerQuoteFilters } from '../components/seller/SellerQuoteFilters';
import { SellerSummaryCards } from '../components/seller/SellerSummaryCards';
import type { SellerDashboardPayload, SellerQuote } from '../components/seller/types';

export const SellerDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [payload, setPayload] = useState<SellerDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedQuote, setSelectedQuote] = useState<SellerQuote | null>(null);
  const [downloadingQuoteId, setDownloadingQuoteId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get('/quotes/seller/dashboard');
        setPayload(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar painel do vendedor.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const quotes = useMemo(() => payload?.quotes || [], [payload?.quotes]);

  const statusOptions = useMemo(() => {
    return Array.from(new Set(quotes.map((quote) => quote.status))).sort();
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return quotes.filter((quote) => {
      const matchesStatus = statusFilter === 'ALL' || quote.status === statusFilter;
      const matchesSearch = !term || [
        quote.numero_orcamento,
        quote.client_name,
        quote.client_cnpj,
        quote.client_city,
        quote.client_uf,
      ].some((value) => String(value || '').toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [quotes, search, statusFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
  };

  const formatDate = (value?: string) => {
    if (!value) return '-';
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  };

  const statusLabel = (statusValue: string) => statusValue.replaceAll('_', ' ');

  const statusClass = (statusValue: string) => {
    if (statusValue.includes('APROVADO') || statusValue.includes('CONVERTIDO')) return 'bg-green-50';
    if (statusValue.includes('CANCELADO') || statusValue.includes('EXPIRADO')) return 'bg-red-50';
    if (statusValue.includes('PENDENTE')) return 'bg-yellow-50';
    return 'bg-gray-50';
  };

  async function handleDownloadPdf(quote: SellerQuote) {
    setDownloadingQuoteId(quote.id);
    try {
      const response = await api.get(`/quotes/${quote.id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orcamento_${quote.numero_orcamento}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao baixar PDF.');
    } finally {
      setDownloadingQuoteId(null);
    }
  }

  if (loading) {
    return <div className="nexus-panel py-12 text-center text-xs font-semibold uppercase text-slate-500">Carregando seu painel comercial...</div>;
  }

  if (error && !payload) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="nexus-back-button">
          <ArrowLeft size={16} /> Voltar ao menu
        </button>
        <div className="nexus-alert-error">{error}</div>
      </div>
    );
  }

  const summary = payload?.summary;

  return (
    <div className="space-y-8">
      <div className="nexus-page-header">
        <button onClick={onBack} className="nexus-back-button">
          <ArrowLeft size={16} /> Voltar ao menu
        </button>
        <h2 className="nexus-title">Meu Painel de Orçamentos</h2>
        <div className="nexus-badge">
          {payload?.seller.name}
        </div>
      </div>

      {error && (
        <div className="nexus-alert-error">{error}</div>
      )}

      {summary && <SellerSummaryCards summary={summary} formatCurrency={formatCurrency} />}

      <SellerQuoteFilters
        search={search}
        statusFilter={statusFilter}
        statusOptions={statusOptions}
        statusLabel={statusLabel}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
      />

      <SellerQuoteCards
        quotes={filteredQuotes}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        statusClass={statusClass}
        statusLabel={statusLabel}
        onSelectQuote={setSelectedQuote}
      />

      {selectedQuote && (
        <SellerQuoteDetailsModal
          downloadingQuoteId={downloadingQuoteId}
          quote={selectedQuote}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          statusLabel={statusLabel}
          onClose={() => setSelectedQuote(null)}
          onDownloadPdf={handleDownloadPdf}
        />
      )}
    </div>
  );
};
