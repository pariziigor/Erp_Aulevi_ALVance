import { Download, Loader2 } from 'lucide-react';
import type { SellerQuote } from './types';

interface SellerQuoteDetailsModalProps {
  downloadingQuoteId: string | null;
  quote: SellerQuote;
  formatCurrency: (value: number) => string;
  formatDate: (value?: string) => string;
  statusLabel: (status: string) => string;
  onClose: () => void;
  onDownloadPdf: (quote: SellerQuote) => void;
}

export function SellerQuoteDetailsModal({
  downloadingQuoteId,
  quote,
  formatCurrency,
  formatDate,
  statusLabel,
  onClose,
  onDownloadPdf,
}: SellerQuoteDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="nexus-panel max-h-[90vh] w-full max-w-5xl space-y-6 overflow-y-auto p-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-2xl font-black font-mono">{quote.numero_orcamento}</h3>
            <p className="text-xs font-mono uppercase text-gray-500">{quote.client_name} - {quote.client_city}/{quote.client_uf}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onDownloadPdf(quote)}
              disabled={downloadingQuoteId === quote.id}
              className="nexus-primary-button"
            >
              {downloadingQuoteId === quote.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              PDF
            </button>
            <button type="button" onClick={onClose} className="nexus-secondary-button">
              Fechar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 text-xs uppercase md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">Status<br /><strong>{statusLabel(quote.status)}</strong></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">Pagamento<br /><strong>{quote.payment_condition || '-'}</strong></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">Frete<br /><strong>{quote.shipping_type || '-'}</strong></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">Criado<br /><strong>{formatDate(quote.created_at)}</strong></div>
        </div>

        <div className="nexus-table-wrap">
          <table className="w-full text-left">
            <thead>
              <tr className="nexus-table-head">
                <th className="p-3">Código</th>
                <th className="p-3">Descrição</th>
                <th className="p-3 text-center">Qtd</th>
                <th className="p-3 text-right">Unitário</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {quote.items.map((item) => (
                <tr key={item.id}>
                  <td className="p-3 font-mono text-xs">{item.codigo}</td>
                  <td className="p-3 font-bold uppercase text-xs">{item.descricao}</td>
                  <td className="p-3 text-center font-mono">{item.quantidade}</td>
                  <td className="p-3 text-right font-mono text-xs">{formatCurrency(item.preco_unitario)}</td>
                  <td className="p-3 text-right font-mono text-xs font-bold">{formatCurrency(item.total_item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 gap-4 text-xs uppercase md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">Subtotal<br /><strong>{formatCurrency(quote.subtotal)}</strong></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">Desconto<br /><strong>{formatCurrency(quote.desconto)}</strong></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">Frete<br /><strong>{formatCurrency(quote.valor_frete)}</strong></div>
          <div className="rounded-2xl border border-orange-200 bg-orange-50/80 p-3 text-orange-700">Total<br /><strong>{formatCurrency(quote.total)}</strong></div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-xs uppercase text-slate-600">
          <strong>Observações:</strong> {quote.observations || 'Sem observações comerciais.'}
        </div>
      </div>
    </div>
  );
}
