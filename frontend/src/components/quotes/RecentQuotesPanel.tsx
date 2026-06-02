import type { QuoteSummary } from './types';

interface RecentQuotesPanelProps {
  quotes: QuoteSummary[];
  formatCurrency: (value: number) => string;
}

export function RecentQuotesPanel({ quotes, formatCurrency }: RecentQuotesPanelProps) {
  return (
    <div className="nexus-panel">
      <h3 className="mb-4 border-b border-slate-200 pb-2 text-sm font-extrabold uppercase text-slate-900">Histórico Recente</h3>
      <div className="divide-y divide-gray-200">
        {quotes.slice(0, 5).map((quote) => (
          <div key={quote.id} className="py-3 flex items-center justify-between gap-4 text-xs font-mono">
            <span className="font-black">{quote.numero_orcamento}</span>
            <span className="uppercase">{quote.status}</span>
            <span>{formatCurrency(Number(quote.total))}</span>
          </div>
        ))}
        {quotes.length === 0 && (
          <div className="py-4 text-center text-xs font-mono uppercase text-gray-500">Nenhum orçamento emitido.</div>
        )}
      </div>
    </div>
  );
}
