// frontend/src/pages/Products.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Filter, ArrowLeft, Layers } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  description: string;
}

export const Products: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (err) {
        console.error('Erro ao buscar catálogo de produtos', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Filtragem dinâmica no lado do cliente para performance fluida
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                          product.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Formatador monetário BRL de precisão
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Sub-Header */}
      <div className="flex justify-between items-center border-b-2 border-black pb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-black uppercase tracking-wider hover:underline">
          <ArrowLeft size={16} /> Voltar ao Menu
        </button>
        <h2 className="text-2xl font-black uppercase tracking-tight">Catálogo de Estruturas & Insumos</h2>
        <div className="flex items-center gap-2 text-xs font-mono bg-black text-white px-3 py-1 uppercase">
          <Layers size={14} /> Total: {filteredProducts.length} itens
        </div>
      </div>

      {/* Barra de Filtros Brutalista */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome do insumo ou código SKU..."
            className="w-full border-2 border-black p-2 pl-10 text-sm focus:outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={18} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full border-2 border-black p-2 pl-10 text-sm focus:outline-none bg-white appearance-none font-bold uppercase tracking-tight"
          >
            <option value="ALL">Todas as Categorias</option>
            <option value="STEEL_FRAME">Light Steel Frame (LSF)</option>
            <option value="WOOD_FRAME">Wood Frame</option>
            <option value="CHALET_KIT">Kits de Chalés</option>
            <option value="COMPLEMENT">Complementos Hidro/Elétricos</option>
          </select>
        </div>
      </div>

      {/* Listagem em Tabela ou Grid de Cards */}
      {loading ? (
        <div className="text-xs font-mono uppercase text-center py-12">Sincronizando catálogo com o banco central...</div>
      ) : (
        <div className="border-2 border-black bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white text-xs font-black uppercase tracking-wider">
                <th className="p-3 w-32">SKU</th>
                <th className="p-3">Item / Descrição</th>
                <th className="p-3 w-40">Categoria</th>
                <th className="p-3 w-28 text-right">Preço Unit.</th>
                <th className="p-3 w-24 text-center">Unidade</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center font-mono text-xs text-gray-500 uppercase">
                    Nenhum produto correspondente aos filtros de busca.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-mono text-xs font-bold">{product.sku}</td>
                    <td className="p-3">
                      <div className="font-bold uppercase">{product.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{product.description}</div>
                    </td>
                    <td className="p-3 text-xs">
                      <span className="border border-black px-2 py-0.5 font-black uppercase bg-gray-100">
                        {product.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-right text-black">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="p-3 font-mono text-xs text-center uppercase font-medium">
                      {product.unit}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};