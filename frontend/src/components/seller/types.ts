export interface SellerSummary {
  total_orcamentos: number;
  orcamentos_pendentes: number;
  orcamentos_aprovados: number;
  orcamentos_cancelados: number;
  taxa_conversao: number;
  valor_total_orcado: number;
  valor_total_aprovado: number;
  ticket_medio: number;
}

export interface SellerQuoteItem {
  id: string;
  codigo?: string;
  descricao?: string;
  categoria?: string;
  unidade_medida?: string;
  quantidade: number;
  preco_unitario: number;
  total_item: number;
}

export interface SellerQuote {
  id: string;
  numero_orcamento: string;
  status: string;
  client_name?: string;
  client_cnpj?: string;
  client_city?: string;
  client_uf?: string;
  subtotal: number;
  desconto: number;
  valor_frete: number;
  total: number;
  payment_condition?: string;
  shipping_type?: string;
  observations?: string;
  client_response?: string;
  created_at: string;
  updated_at?: string;
  items: SellerQuoteItem[];
}

export interface SellerDashboardPayload {
  seller: {
    id: string;
    name: string;
    email: string;
  };
  summary: SellerSummary;
  quotes: SellerQuote[];
}
