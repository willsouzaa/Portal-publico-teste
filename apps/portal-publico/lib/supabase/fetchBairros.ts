import { createSupabaseBrowserClient } from "./client";

export async function fetchBairros(): Promise<string[]> {
  const supabase = createSupabaseBrowserClient();
  // Busca todos os bairros da view public_empreendimentos
  const { data, error } = await supabase
    .from("public_empreendimentos")
    .select("bairro")
    .neq("bairro", null);

  console.log('Resultado Supabase:', data);
  if (error) {
    console.error("Erro ao buscar bairros:", error);
    return [];
  }

  // Garante que está acessando o campo correto
  const bairros = Array.from(new Set((data ?? []).map((e: any) => e.bairro || e.BAIRRO || e.Bairro).filter(Boolean)));
  return bairros;
}
