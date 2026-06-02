import { Plus } from 'lucide-react';
import { CommercialSelect } from './CommercialSelect';
import type { ClientOption, ProductOption, SelectOption } from './types';

type Category = 'LSF' | 'MM' | 'CHALE';

interface CategorySelectorProps {
  category: Category;
  onChange: (category: Category) => void;
}

interface ClientSelectorProps {
  clients: ClientOption[];
  clientOptions: ClientOption[];
  clientSearch: string;
  selectedClientId: string;
  onSearchChange: (value: string) => void;
  onClientChange: (value: string) => void;
}

interface CommercialRulesProps {
  paymentOptions: SelectOption[];
  paymentCondition: string;
  shippingOptions: SelectOption[];
  shippingType: string;
  onPaymentChange: (value: string) => void;
  onShippingChange: (value: string) => void;
}

interface ProductSelectorProps {
  category: Category;
  filteredProductsCount: number;
  productsByCategoryCount: number;
  productOptions: ProductOption[];
  productSearch: string;
  quantityInput: number;
  selectedProductId: string;
  formatCurrency: (value: number) => string;
  onAddItem: () => void;
  onProductChange: (value: string) => void;
  onQuantityChange: (value: number) => void;
  onSearchChange: (value: string) => void;
}

export function CategorySelector({ category, onChange }: CategorySelectorProps) {
  return (
    <div className="nexus-panel relative z-20 space-y-4">
      <h3 className="border-b border-slate-200 pb-2 text-sm font-extrabold uppercase text-slate-900">1. Categoria</h3>
      <div className="grid grid-cols-3 gap-2">
        {(['LSF', 'MM', 'CHALE'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-xl border p-2 text-xs font-extrabold uppercase transition ${category === option ? 'border-orange-400 bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'border-slate-200 bg-white/80 text-slate-700 hover:border-orange-300 hover:text-orange-600'}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ClientSelector({
  clients,
  clientOptions,
  clientSearch,
  selectedClientId,
  onClientChange,
  onSearchChange,
}: ClientSelectorProps) {
  return (
    <div className="nexus-panel relative z-20 space-y-4">
      <h3 className="border-b border-slate-200 pb-2 text-sm font-extrabold uppercase text-slate-900">2. Cliente</h3>
      <div>
        <label className="block text-xs font-bold uppercase mb-1">Buscar por Razão Social ou CNPJ</label>
        <input
          type="text"
          value={clientSearch}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Digite parte do nome ou CNPJ..."
          className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
        />
        <div className="mt-1 text-[10px] font-mono uppercase text-gray-500">
          {clientOptions.length} de {clients.length} clientes encontrados
        </div>
      </div>
      <select
        value={selectedClientId}
        onChange={(event) => onClientChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm font-medium uppercase outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
      >
        <option value="">-- Selecione o Cliente --</option>
        {clientOptions.map((client) => (
          <option key={client.id} value={client.id}>{client.razao_social} ({client.cnpj})</option>
        ))}
      </select>
    </div>
  );
}

export function CommercialRules({
  paymentCondition,
  paymentOptions,
  shippingOptions,
  shippingType,
  onPaymentChange,
  onShippingChange,
}: CommercialRulesProps) {
  return (
    <div className="nexus-panel relative z-50 space-y-4 overflow-visible">
      <h3 className="border-b border-slate-200 pb-2 text-sm font-extrabold uppercase text-slate-900">3. Regras Comerciais</h3>
      <div>
        <label className="block text-xs font-bold uppercase mb-1">Condição de Pagamento</label>
        <CommercialSelect options={paymentOptions} value={paymentCondition} onChange={onPaymentChange} />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase mb-1">Tipo de Frete</label>
        <CommercialSelect options={shippingOptions} value={shippingType} onChange={onShippingChange} />
      </div>
    </div>
  );
}

export function ProductSelector({
  category,
  filteredProductsCount,
  formatCurrency,
  productOptions,
  productSearch,
  productsByCategoryCount,
  quantityInput,
  selectedProductId,
  onAddItem,
  onProductChange,
  onQuantityChange,
  onSearchChange,
}: ProductSelectorProps) {
  return (
    <div className="nexus-panel relative z-0 space-y-4">
      <h3 className="border-b border-slate-200 pb-2 text-sm font-extrabold uppercase text-slate-900">4. Itens</h3>
      <div>
        <label className="block text-xs font-bold uppercase mb-1">Buscar por Código ou Descrição</label>
        <input
          type="text"
          value={productSearch}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Digite código ou descrição do item..."
          className="mb-3 w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
        />
        <div className="mb-2 text-[10px] font-mono uppercase text-gray-500">
          {filteredProductsCount} de {productsByCategoryCount} itens da categoria {category}
        </div>
        <label className="block text-xs font-bold uppercase mb-1">Produto</label>
        <select
          value={selectedProductId}
          onChange={(event) => onProductChange(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm font-medium uppercase outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
        >
          <option value="">-- Selecione o Produto --</option>
          {productOptions.map((product) => (
            <option key={product.id} value={product.id}>
              [{product.codigo}] {product.descricao} - {formatCurrency(Number(product.preco))}/{product.unidade_medida}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold uppercase mb-1">Quantidade</label>
        <input
          type="number"
          min="1"
          value={quantityInput}
          onChange={(event) => onQuantityChange(Number(event.target.value))}
          className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm font-mono outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
        />
      </div>
      <button type="button" onClick={onAddItem} className="nexus-secondary-button w-full">
        <Plus size={16} /> Inserir Item
      </button>
    </div>
  );
}
