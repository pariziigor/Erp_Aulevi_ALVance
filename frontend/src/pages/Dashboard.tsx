import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { AuditLogTable } from '../components/dashboard/AuditLogTable';
import { DashboardMetrics } from '../components/dashboard/DashboardMetrics';
import { DashboardSummaryPanels } from '../components/dashboard/DashboardSummaryPanels';
import type { AuditLog, DashboardStats } from '../components/dashboard/types';

export const Dashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [summaryResponse, logsResponse] = await Promise.all([
          api.get('/quotes/analytics/summary'),
          user?.role === 'ADM' ? api.get('/audit-logs?limit=20') : Promise.resolve({ data: [] }),
        ]);
        setStats(summaryResponse.data);
        setAuditLogs(logsResponse.data);
      } catch (err) {
        console.error('Erro ao processar métricas do dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [user?.role]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(value || 0));
  };

  const formatDateTime = (value: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  };

  const describeAction = (action: string) => {
    const labels: Record<string, string> = {
      client_contact_updated: 'Contato do cliente atualizado',
      user_created: 'Usuário criado',
      user_permissions_updated: 'Permissão de usuário atualizada',
    };
    return labels[action] || action.replaceAll('_', ' ');
  };

  const describeChanges = (changes?: AuditLog['changes']) => {
    if (!changes) return 'Sem detalhes de campos.';
    const labels: Record<string, string> = {
      contato_email: 'e-mail',
      contato_whatsapp: 'WhatsApp',
      contato_telefone: 'telefone',
      role: 'permissão',
      is_active: 'status',
    };
    return Object.entries(changes)
      .map(([field, values]) => `${labels[field] || field}: ${values.old || '-'} -> ${values.new || '-'}`)
      .join(' | ');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/55 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <button onClick={onBack} className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase text-slate-600 shadow-sm transition hover:border-orange-300 hover:text-orange-600">
          <ArrowLeft size={16} /> Voltar ao menu
        </button>
        <div className="md:text-right">
          <p className="text-xs font-bold uppercase text-orange-600">Administrativo</p>
          <h2 className="text-2xl font-extrabold uppercase text-slate-950">Core Analytics</h2>
        </div>
      </div>

      {loading || !stats ? (
        <div className="rounded-2xl border border-white/60 bg-white/70 py-12 text-center text-xs font-semibold uppercase text-slate-500 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
          Consolidando métricas operacionais...
        </div>
      ) : (
        <>
          <DashboardMetrics stats={stats} formatCurrency={formatCurrency} />
          <DashboardSummaryPanels stats={stats} formatCurrency={formatCurrency} />
          {user?.role === 'ADM' && (
            <AuditLogTable
              logs={auditLogs}
              describeAction={describeAction}
              describeChanges={describeChanges}
              formatDateTime={formatDateTime}
            />
          )}
        </>
      )}
    </div>
  );
};
