export interface Client {
  id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  cidade: string;
  uf: string;
  contato_nome: string;
  contato_email: string;
  contato_whatsapp: string;
  contato_telefone?: string;
}

export interface ClientFormState {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  situacaoCadastral: string;
  cidade: string;
  uf: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  contatoNome: string;
  contatoEmail: string;
  contatoWhatsapp: string;
  contatoTelefone: string;
}
