export interface DashboardStats {
  total_clientes: number;
  total_orcamentos: number;
  orcamentos_pendentes: number;
  orcamentos_aprovados: number;
  orcamentos_cancelados: number;
  taxa_conversao: number;
  valor_total_orcado_mes: number;
  valor_total_aprovado_mes: number;
  ticket_medio: number;
  categoria_maior_faturamento?: string | null;
  produtos_mais_orcados: Array<{
    codigo: string;
    descricao: string;
    quantidade: number;
  }>;
}

export interface AuditLog {
  id: string;
  user_name?: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_label?: string;
  changes?: Record<string, { old?: string | boolean | null; new?: string | boolean | null }>;
  created_at: string;
}
