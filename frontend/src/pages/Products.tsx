import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Layers } from 'lucide-react';
import { ProductBulkActions } from '../components/products/ProductBulkActions';
import { ProductFilters } from '../components/products/ProductFilters';
import { ProductsTable } from '../components/products/ProductsTable';
import { useToast } from '../components/shared/Toast';
import type { Product } from '../components/products/types';
import { useAuth } from '../context/useAuth';
import api from '../services/api';

export const Products: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao buscar catalogo de produtos.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter((product) => {
    const term = search.toLowerCase();
    const matchesSearch =
      product.descricao.toLowerCase().includes(term) ||
      product.codigo.toLowerCase().includes(term);
    const matchesCategory = categoryFilter === 'ALL' || product.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  function downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async function handleExportProducts() {
    setExporting(true);
    try {
      const response = await api.get('/products/export', { responseType: 'blob' });
      downloadBlob(
        new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        'produtos_aulevi.xlsx'
      );
      addToast('Planilha de produtos gerada com sucesso.', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao exportar produtos.', 'error');
    } finally {
      setExporting(false);
    }
  }

  async function handleDownloadTemplate() {
    try {
      const response = await api.get('/products/template', { responseType: 'blob' });
      downloadBlob(
        new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        'modelo_produtos_aulevi.xlsx'
      );
      addToast('Modelo Excel baixado com sucesso.', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao baixar modelo da planilha.', 'error');
    }
  }

  async function handleImportProducts(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setImporting(true);

    try {
      const response = await api.post('/products/import', file, {
        headers: {
          'Content-Type': file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'X-Filename': file.name,
        },
      });
      addToast(`Carga concluida: ${response.data.criados} criados e ${response.data.atualizados} atualizados.`, 'success');
      await fetchProducts();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao importar produtos.', 'error');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="nexus-page-header">
        <button onClick={onBack} className="nexus-back-button">
          <ArrowLeft size={16} /> Voltar ao menu
        </button>
        <h2 className="nexus-title">Catalogo de Estruturas & Insumos</h2>
        <div className="nexus-badge">
          <Layers size={14} /> Total: {filteredProducts.length} itens
        </div>
      </div>

      {user?.role === 'ADM' && (
        <ProductBulkActions
          exporting={exporting}
          importing={importing}
          onDownloadTemplate={handleDownloadTemplate}
          onExportProducts={handleExportProducts}
          onImportProducts={handleImportProducts}
        />
      )}

      <ProductFilters
        search={search}
        categoryFilter={categoryFilter}
        onSearchChange={setSearch}
        onCategoryChange={setCategoryFilter}
      />

      <ProductsTable loading={loading} products={filteredProducts} />
    </div>
  );
};
