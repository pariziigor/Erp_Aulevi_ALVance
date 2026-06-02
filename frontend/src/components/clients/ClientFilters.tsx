import { Filter, Search } from 'lucide-react';

interface ClientFiltersProps {
  availableUfs: string[];
  search: string;
  ufFilter: string;
  onSearchChange: (value: string) => void;
  onUfFilterChange: (value: string) => void;
}

export function ClientFilters({ availableUfs, search, ufFilter, onSearchChange, onUfFilterChange }: ClientFiltersProps) {
  return (
    <div className="nexus-filter-bar md:grid-cols-4">
      <div className="relative md:col-span-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por CNPJ, razão social, cidade, contato, email ou WhatsApp..."
          className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 pl-10 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
        />
      </div>
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <select
          value={ufFilter}
          onChange={(event) => onUfFilterChange(event.target.value)}
          className="w-full appearance-none rounded-2xl border border-slate-200 bg-white/80 p-3 pl-10 text-sm font-bold uppercase outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
        >
          <option value="ALL">Todos os UFs</option>
          {availableUfs.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
