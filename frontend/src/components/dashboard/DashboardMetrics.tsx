import { Activity, FileText, TrendingUp, Users } from 'lucide-react';
import type { DashboardStats } from './types';

interface DashboardMetricsProps {
  stats: DashboardStats;
  formatCurrency: (value: number) => string;
}

export function DashboardMetrics({ stats, formatCurrency }: DashboardMetricsProps) {
  const cardClass = 'flex h-36 flex-col justify-between rounded-2xl border border-white/60 bg-white/70 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl';

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
      <div className={cardClass}>
        <div className="flex items-start justify-between">
          <span className="text-xs font-bold uppercase text-slate-500">Orçado no mês</span>
          <TrendingUp className="text-orange-500" size={20} />
        </div>
        <div>
          <div className="text-3xl font-extrabold text-slate-950">{formatCurrency(stats.valor_total_orcado_mes)}</div>
          <p className="mt-1 text-[11px] font-medium uppercase text-slate-400">pipeline comercial real</p>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-start justify-between">
          <span className="text-xs font-bold uppercase text-slate-500">Clientes</span>
          <Users className="text-orange-500" size={20} />
        </div>
        <div>
          <div className="text-3xl font-extrabold text-slate-950">{stats.total_clientes}</div>
          <p className="mt-1 text-[11px] font-medium uppercase text-slate-400">base compartilhada</p>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-start justify-between">
          <span className="text-xs font-bold uppercase text-slate-500">Orçamentos</span>
          <FileText className="text-orange-500" size={20} />
        </div>
        <div>
          <div className="text-3xl font-extrabold text-slate-950">{stats.total_orcamentos}</div>
          <p className="mt-1 text-[11px] font-medium uppercase text-slate-400">emitidos no ERP</p>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-start justify-between">
          <span className="text-xs font-bold uppercase text-slate-500">Conversão</span>
          <Activity className="text-orange-500" size={20} />
        </div>
        <div>
          <div className="text-3xl font-extrabold text-slate-950">{stats.taxa_conversao}%</div>
          <p className="mt-1 text-[11px] font-medium uppercase text-slate-400">aprovados sobre emitidos</p>
        </div>
      </div>
    </div>
  );
}
