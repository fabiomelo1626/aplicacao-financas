// src/services/viacep.ts

export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function fetchEnderecoByCEP(cep: string): Promise<ViaCEPResponse | null> {
  const cleanCEP = cep.replace(/\D/g, '');
  if (cleanCEP.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    const data: ViaCEPResponse = await res.json();
    if (data.erro) return null;
    return data;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
}