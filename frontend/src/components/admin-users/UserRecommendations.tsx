import { Users } from 'lucide-react';

export function UserRecommendations() {
  return (
    <div className="nexus-panel p-5">
      <h3 className="mb-3 flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-extrabold uppercase text-slate-900">
        <Users size={16} /> Recomendações
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono uppercase text-gray-600">
        <p>Use ADM apenas para quem gerencia usuários, catálogo e indicadores.</p>
        <p>Use Vendedor para operação comercial diária e emissão de propostas.</p>
        <p>Desative acessos imediatamente em desligamentos ou mudanças de função.</p>
      </div>
    </div>
  );
}
