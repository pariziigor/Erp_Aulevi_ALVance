import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Activity, CheckCircle2, CircleDollarSign, Clock3, FileText, Settings2, TrendingUp, Users, XCircle } from 'lucide-react';

import type { DashboardStats } from '../dashboard/types';
import type { SellerDashboardPayload, SellerSummary } from '../seller/types';
import { SkeletonCard } from '../shared/Skeleton';
import api from '../../services/api';

type UserRole = 'ADM' | 'SELLER';

interface HomeOverviewProps {
  userId: string;
  role: UserRole;
}

interface MetricDefinition {
  id: string;
  label: string;
  helper: string;
  icon: ReactNode;
  value: string;
}

const DEFAULT_METRICS: Record<UserRole, string[]> = {
  ADM: ['quoted_value', 'approved_value', 'pending', 'conversion'],
  SELLER: ['quoted_value', 'approved_value', 'pending', 'conversion'],
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function adminMetrics(stats: DashboardStats): MetricDefinition[] {
  return [
    { id: 'quoted_value', label: 'Orçado no mês', value: formatCurrency(stats.valor_total_orcado_mes), helper: 'pipeline comercial', icon: <TrendingUp size={20} /> },
    { id: 'approved_value', label: 'Aprovado no mês', value: formatCurrency(stats.valor_total_aprovado_mes), helper: 'valor convertido', icon: <CircleDollarSign size={20} /> },
    { id: 'pending', label: 'Pendentes', value: String(stats.orcamentos_pendentes), helper: 'aguardando avanço', icon: <Clock3 size={20} /> },
    { id: 'conversion', label: 'Conversão', value: `${stats.taxa_conversao}%`, helper: 'aprovados sobre emitidos', icon: <Activity size={20} /> },
    { id: 'clients', label: 'Clientes ativos', value: String(stats.total_clientes), helper: 'base compartilhada', icon: <Users size={20} /> },
    { id: 'quotes', label: 'Orçamentos', value: String(stats.total_orcamentos), helper: 'total emitido', icon: <FileText size={20} /> },
    { id: 'approved', label: 'Aprovados', value: String(stats.orcamentos_aprovados), helper: 'negócios aprovados', icon: <CheckCircle2 size={20} /> },
    { id: 'canceled', label: 'Cancelados', value: String(stats.orcamentos_cancelados), helper: 'oportunidades encerradas', icon: <XCircle size={20} /> },
    { id: 'ticket', label: 'Ticket médio', value: formatCurrency(stats.ticket_medio), helper: 'média dos aprovados', icon: <CircleDollarSign size={20} /> },
  ];
}

function sellerMetrics(summary: SellerSummary): MetricDefinition[] {
  return [
    { id: 'quoted_value', label: 'Valor orçado', value: formatCurrency(summary.valor_total_orcado), helper: 'seu pipeline total', icon: <TrendingUp size={20} /> },
    { id: 'approved_value', label: 'Valor aprovado', value: formatCurrency(summary.valor_total_aprovado), helper: 'seus negócios aprovados', icon: <CircleDollarSign size={20} /> },
    { id: 'pending', label: 'Pendentes', value: String(summary.orcamentos_pendentes), helper: 'aguardando avanço', icon: <Clock3 size={20} /> },
    { id: 'conversion', label: 'Conversão', value: `${summary.taxa_conversao}%`, helper: 'sua taxa de aprovação', icon: <Activity size={20} /> },
    { id: 'quotes', label: 'Orçamentos', value: String(summary.total_orcamentos), helper: 'total emitido por você', icon: <FileText size={20} /> },
    { id: 'approved', label: 'Aprovados', value: String(summary.orcamentos_aprovados), helper: 'negócios aprovados', icon: <CheckCircle2 size={20} /> },
    { id: 'canceled', label: 'Cancelados', value: String(summary.orcamentos_cancelados), helper: 'oportunidades encerradas', icon: <XCircle size={20} /> },
    { id: 'ticket', label: 'Ticket médio', value: formatCurrency(summary.ticket_medio), helper: 'média dos orçamentos', icon: <CircleDollarSign size={20} /> },
  ];
}

export function HomeOverview({ userId, role }: HomeOverviewProps) {
  const storageKey = `@ALVance:home-metrics:${userId}`;
  const [metrics, setMetrics] = useState<MetricDefinition[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : DEFAULT_METRICS[role];
    } catch {
      return DEFAULT_METRICS[role];
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customizing, setCustomizing] = useState(false);

  useEffect(() => {
    async function loadSummary() {
      try {
        const response = await api.get(role === 'ADM' ? '/quotes/analytics/summary' : '/quotes/seller/dashboard');
        setMetrics(role === 'ADM'
          ? adminMetrics(response.data as DashboardStats)
          : sellerMetrics((response.data as SellerDashboardPayload).summary));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível carregar o resumo.');
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, [role]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(selectedIds));
  }, [selectedIds, storageKey]);

  const visibleMetrics = useMemo(
    () => selectedIds.map((id) => metrics.find((metric) => metric.id === id)).filter((metric): metric is MetricDefinition => Boolean(metric)),
    [metrics, selectedIds],
  );

  function toggleMetric(metricId: string) {
    setSelectedIds((current) => {
      if (current.includes(metricId)) {
        return current.length === 1 ? current : current.filter((id) => id !== metricId);
      }
      return [...current, metricId];
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-orange-600">Visão rápida</p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-950">Resumo da operação</h2>
          <p className="mt-1 text-sm text-slate-500">Os indicadores mais importantes para começar o dia.</p>
        </div>
        <button type="button" onClick={() => setCustomizing((current) => !current)} className="nexus-secondary-button">
          <Settings2 size={16} /> Personalizar resumo
        </button>
      </div>

      {customizing && (
        <div className="nexus-panel p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold uppercase text-slate-900">Indicadores visíveis</h3>
              <p className="mt-1 text-xs text-slate-500">Escolha os cards. A seleção fica salva neste navegador.</p>
            </div>
            <button type="button" onClick={() => setSelectedIds(DEFAULT_METRICS[role])} className="text-xs font-bold uppercase text-orange-600 hover:text-orange-700">
              Restaurar padrão
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
              <label key={metric.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white/65 p-3 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={selectedIds.includes(metric.id)} onChange={() => toggleMetric(metric.id)} />
                {metric.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)}
        </div>
      ) : error ? (
        <div className="nexus-alert-error">{error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {visibleMetrics.map((metric) => (
            <article key={metric.id} className="nexus-panel flex min-h-36 flex-col justify-between p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-bold uppercase text-slate-500">{metric.label}</span>
                <span className="text-orange-500">{metric.icon}</span>
              </div>
              <div>
                <strong className="block break-words text-2xl font-extrabold text-slate-950">{metric.value}</strong>
                <span className="mt-1 block text-[11px] font-semibold uppercase text-slate-400">{metric.helper}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
