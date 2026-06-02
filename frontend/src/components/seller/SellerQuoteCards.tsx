import { CalendarDays, Eye } from 'lucide-react';
import type { SellerQuote } from './types';

interface SellerQuoteCardsProps {
  quotes: SellerQuote[];
  formatCurrency: (value: number) => string;
  formatDate: (value?: string) => string;
  statusClass: (status: string) => string;
  statusLabel: (status: string) => string;
  onSelectQuote: (quote: SellerQuote) => void;
}

export function SellerQuoteCards({
  quotes,
  formatCurrency,
  formatDate,
  statusClass,
  statusLabel,
  onSelectQuote,
}: SellerQuoteCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {quotes.length === 0 ? (
        <div className="nexus-panel md:col-span-2 xl:col-span-3 p-8 text-center text-xs font-semibold uppercase text-slate-500">
          Nenhum orçamento encontrado.
        </div>
      ) : (
        quotes.map((quote) => (
          <button
            key={quote.id}
            type="button"
            onClick={() => onSelectQuote(quote)}
            className="nexus-surface flex min-h-56 flex-col justify-between p-5 text-left transition-all hover:-translate-y-1 hover:border-orange-300/60 hover:bg-white/90 hover:shadow-2xl hover:shadow-orange-500/10"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-black font-mono">{quote.numero_orcamento}</div>
                  <div className="text-xs font-bold uppercase text-gray-500">{quote.client_name || 'Cliente sem nome'}</div>
                </div>
                <span className={`border border-black px-2 py-1 text-[10px] font-black uppercase ${statusClass(quote.status)}`}>
                  {statusLabel(quote.status)}
                </span>
              </div>
              <div className="text-2xl font-black font-mono">{formatCurrency(quote.total)}</div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-300 pt-3 text-xs font-mono uppercase text-gray-500">
              <span className="flex items-center gap-1"><CalendarDays size={14} /> {formatDate(quote.created_at)}</span>
              <span className="flex items-center gap-1"><Eye size={14} /> Detalhes</span>
            </div>
          </button>
        ))
      )}
    </div>
  );
}
