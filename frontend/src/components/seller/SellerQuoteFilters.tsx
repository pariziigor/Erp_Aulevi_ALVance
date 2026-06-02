import { Search } from 'lucide-react';

interface SellerQuoteFiltersProps {
  search: string;
  statusFilter: string;
  statusOptions: string[];
  statusLabel: (status: string) => string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
}

export function SellerQuoteFilters({
  search,
  statusFilter,
  statusOptions,
  statusLabel,
  onSearchChange,
  onStatusFilterChange,
}: SellerQuoteFiltersProps) {
  return (
    <div className="nexus-filter-bar md:grid-cols-4">
      <div className="relative md:col-span-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por número, cliente, CNPJ ou cidade..."
          className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 pl-10 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
        />
      </div>
      <select
        value={statusFilter}
        onChange={(event) => onStatusFilterChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm font-bold uppercase outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
      >
        <option value="ALL">Todos os Status</option>
        {statusOptions.map((option) => (
          <option key={option} value={option}>{statusLabel(option)}</option>
        ))}
      </select>
    </div>
  );
}
