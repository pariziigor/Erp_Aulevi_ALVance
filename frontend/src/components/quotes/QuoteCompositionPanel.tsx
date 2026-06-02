import { Download, Loader2, Trash2 } from 'lucide-react';
import type { QuoteItem } from './types';

interface QuoteCompositionPanelProps {
  discount: number;
  generatingPdf: boolean;
  items: QuoteItem[];
  observations: string;
  shippingValue: number;
  subtotal: number;
  totalBudget: number;
  formatCurrency: (value: number) => string;
  onDiscountChange: (value: number) => void;
  onObservationsChange: (value: string) => void;
  onRemoveItem: (index: number) => void;
  onShippingValueChange: (value: number) => void;
}

export function QuoteCompositionPanel({
  discount,
  formatCurrency,
  generatingPdf,
  items,
  observations,
  shippingValue,
  subtotal,
  totalBudget,
  onDiscountChange,
  onObservationsChange,
  onRemoveItem,
  onShippingValueChange,
}: QuoteCompositionPanelProps) {
  return (
    <div className="nexus-panel flex min-h-[400px] flex-col justify-between">
      <div>
        <h3 className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 text-sm font-extrabold uppercase text-slate-900">
          <span>Composição do Orçamento</span>
          <span className="font-mono text-xs text-gray-500">ITENS: {items.length}</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase text-slate-600">
                <th className="pb-2">Código</th>
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
                  <td colSpan={6} className="py-8 text-center font-mono text-xs text-gray-400 uppercase">Nenhum item orçado até o momento.</td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.product_id} className="hover:bg-orange-50/50">
                    <td className="py-2 font-mono text-xs">{item.codigo}</td>
                    <td className="py-2 uppercase font-bold text-xs">{item.descricao}</td>
                    <td className="py-2 text-center font-mono">{item.quantity}</td>
                    <td className="py-2 text-right font-mono text-xs">{formatCurrency(item.price_unit)}</td>
                    <td className="py-2 text-right font-mono text-xs font-bold">{formatCurrency(item.quantity * item.price_unit)}</td>
                    <td className="py-2 text-center">
                      <button type="button" onClick={() => onRemoveItem(index)} className="text-black hover:text-red-600 transition-colors">
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

      <div className="mt-6 space-y-4 border-t border-slate-200 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase mb-1">Desconto</label>
            <input type="number" min="0" value={discount} onChange={(event) => onDiscountChange(Number(event.target.value))} className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm font-mono outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase mb-1">Valor do Frete</label>
            <input type="number" min="0" value={shippingValue} onChange={(event) => onShippingValueChange(Number(event.target.value))} className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm font-mono outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-black uppercase mb-1">Observações Comerciais</label>
          <textarea
            value={observations}
            onChange={(event) => onObservationsChange(event.target.value)}
            placeholder="Ex: Proposta válida por 10 dias."
            className="h-16 w-full resize-none rounded-2xl border border-slate-200 bg-white/80 p-3 text-xs outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
          />
        </div>
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-orange-200/70 bg-orange-50/60 p-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <div className="text-xs font-black uppercase tracking-wider text-gray-600">Subtotal: {formatCurrency(subtotal)}</div>
            <div className="text-xs font-black uppercase tracking-wider text-gray-600">Desconto: {formatCurrency(Number(discount || 0))}</div>
            <div className="text-xs font-black uppercase tracking-wider text-gray-600">Frete: {formatCurrency(Number(shippingValue || 0))}</div>
            <div className="text-3xl font-black font-mono tracking-tight text-black">{formatCurrency(totalBudget)}</div>
          </div>
          <button
            type="submit"
            disabled={generatingPdf || items.length === 0}
            className="nexus-primary-button w-full px-6 py-3 md:w-auto"
          >
            {generatingPdf ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Gerando PDF...
              </>
            ) : (
              <>
                <Download size={16} /> Salvar & Emitir PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
