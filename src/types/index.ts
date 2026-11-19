export interface User {
  id: number;
  username: string;
  fullname: string;
  nome: string;
  email?: string;
  first_access?: boolean;
}

export interface Local {
  id: number;
  nome: string;
  Cidade?: string;
  Estado?: string;
}

export interface LocalAcesso {
  id: number;
  nome: string;
  cnpj?: number | string;
  Logradouro?: string;
  Numero?: string;
  Bairro?: string;
  CEP?: number | string;
  Cidade?: string;
  Estado?: string;
  email?: string;
  telefone?: number | string;
  logo?: string;
  is_active?: boolean;
}


export interface TipoAtendimento {
  id: number;
  nome?: string;
  descricao?: string;
  nome_tipo?: string;
  [key: string]: any; // Permite ler chaves dinâmicas com segurança
}



// src/types/index.ts

export interface ParceiroEmpresa {
  id: number;
  user_id?: number;
  local_id: number;
  RazaoSocial?: string;
  NomeFantasia?: string;
  CNAE?: number;
  Tipo?: number;
  CNPJCPF: number | string;
  Logradouro?: string;
  Numero?: string;
  Bairro?: string;
  CEP?: number | string;
  Cidade?: string;
  Estado?: string;
  Is_PessoaJuridico: boolean;
  Is_PessoaFisico: boolean;
  Telefone?: number | string;
  Email?: string;
  InscricaoEstadual?: number | string;
  InscricaoMunicipal?: number | string;
  ProdutosServicosFornecidos?: string;
  InformacoesAdicionais?: string;
  ativo: boolean;
}


// src/types/index.ts

// ... (seus tipos existentes: User, LocalAcesso, TipoAtendimento, ParceiroEmpresa)

export interface CobrancaPixRequest {
  empresa_id?: number | string;
  chave_pix: string;
  valor: number;
  descricao?: string;
}

export interface CobrancaPixResponse {
  cobranca_id: string;
  valor: number;
  chave_pix: string;
  qr_code_base64: string;
  status: 'PENDENTE' | 'AGUARDANDO_VALIDACAO' | 'CONCLUIDO' | 'RECUSADO';
}

export interface UploadComprovanteResponse {
  mensagem: string;
  cobranca_id: string;
  status: string;
}

// src/types/index.ts

export interface EntradaRecebimento {
  id: string;
  empresa_id?: number;
  valor: number;
  chave_pix: string;
  descricao?: string;
  status: 'PENDENTE' | 'AGUARDANDO_VALIDACAO' | 'CONCLUIDO' | 'RECUSADO';
  comprovante_url?: string;
  criado_em: string;
}

