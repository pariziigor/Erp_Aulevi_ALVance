import { ArrowUpRight } from 'lucide-react';
import type { DashboardStats } from './types';

interface DashboardSummaryPanelsProps {
  stats: DashboardStats;
  formatCurrency: (value: number) => string;
}

export function DashboardSummaryPanels({ stats, formatCurrency }: DashboardSummaryPanelsProps) {
  const panelClass = 'rounded-2xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl';

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className={panelClass}>
        <h3 className="mb-4 border-b border-slate-200 pb-3 text-sm font-extrabold uppercase text-slate-900">Funil Comercial</h3>
        <div className="space-y-3 text-sm text-slate-600">
          <p className="flex justify-between gap-3">Pendentes <strong className="text-slate-950">{stats.orcamentos_pendentes}</strong></p>
          <p className="flex justify-between gap-3">Aprovados <strong className="text-emerald-600">{stats.orcamentos_aprovados}</strong></p>
          <p className="flex justify-between gap-3">Cancelados <strong className="text-red-600">{stats.orcamentos_cancelados}</strong></p>
          <p className="flex justify-between gap-3">Aprovado no mês <strong className="text-slate-950">{formatCurrency(stats.valor_total_aprovado_mes)}</strong></p>
          <p className="flex justify-between gap-3">Ticket médio <strong className="text-slate-950">{formatCurrency(stats.ticket_medio)}</strong></p>
        </div>
      </div>

      <div className={panelClass}>
        <h3 className="mb-4 border-b border-slate-200 pb-3 text-sm font-extrabold uppercase text-slate-900">Categoria Líder</h3>
        <div className="text-4xl font-extrabold text-slate-950">{stats.categoria_maior_faturamento || '-'}</div>
        <p className="mt-2 text-xs font-medium uppercase text-slate-500">Maior faturamento nos itens orçados.</p>
      </div>

      <div className={panelClass}>
        <h3 className="mb-4 border-b border-slate-200 pb-3 text-sm font-extrabold uppercase text-slate-900">Produtos Mais Orçados</h3>
        <div className="space-y-3 text-xs text-slate-600">
          {stats.produtos_mais_orcados.length === 0 ? (
            <p className="uppercase text-slate-500">Sem itens orçados ainda.</p>
          ) : (
            stats.produtos_mais_orcados.map((product) => (
              <p key={product.codigo} className="flex items-center gap-2 rounded-xl bg-slate-50/80 px-3 py-2">
                <ArrowUpRight className="text-orange-500" size={14} /> <strong>{product.codigo}</strong> {product.quantidade} un.
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
