export type PublicTipologia = {
  id?: string | null;
  tipo?: string | null;
  quartos?: number | null;
  suites?: number | null;
  banheiros?: number | null;
  vagas?: number | null;
  area_privativa?: number | null;
  area_total?: number | null;
  metragem?: number | null;
  preco?: number | null;
};

export type PublicGaleriaFoto = {
  id: string;
  url: string;
  is_capa: boolean;
  ordem: number;
};

export type PublicEmpreendimento = {
  id: string;
  nome: string;
  tipo?: string | null;
  slug?: string | null;
  cidade: string;
  estado: string;
  bairro: string | null;
  destaque: string | null;
  descricao: string | null;
  status: string;
  data_entrega_prevista: string | null;
  is_oportunidade: boolean;
  preco_minimo: string | number | null;
  imagem_capa?: string | null;
  tipologias?: PublicTipologia[] | null;
  galeria?: PublicGaleriaFoto[] | null;
  updated_at: string;
};

export type PublicEmpreendimentoDetail = PublicEmpreendimento;
