import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LeadData {
  negocio: string;
  segmento: string;
  tipo_negocio: string;
  desafio: string;
  marketing_anterior: string;
  orcamento: string;
  quando_comecar: string;
  qualificado: boolean;
  nome: string;
  whatsapp: string;
  email: string;
  empresa: string;
  instagram?: string;
  cargo: string;
  tempo_mercado: string;
  procedimentos_mes: string;
  ticket_medio: string;
  retorno_cliente: string;
  fonte_clientes: string;
  ciclo_vendas: string;
  taxa_fechamento: string;
  campanhas_pagas: string;
  melhor_resultado: string;
  prova_social: string;
  diferencial: string;
  case_marcante: string;
  capacidade_fechamento: string;
  objetivo_90_dias: string;
}

export async function saveLead(data: LeadData) {
  const { error } = await supabase.from("leads").insert([data]);
  if (error) throw error;
}
