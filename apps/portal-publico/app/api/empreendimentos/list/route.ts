import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createSupabaseServerClient({ schema: 'public' });
  const { data, error } = await supabase
    .from('public_empreendimentos')
  .select('id,nome,cidade,estado,bairro,destaque,descricao,preco_minimo,status,is_oportunidade,imagem_capa')
    .order('is_oportunidade', { ascending: false })
    .order('preco_minimo', { ascending: true });

  if (error) {
    console.error('erro ao buscar empreendimentos (api):', error);
    return NextResponse.json({ data: [] }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}
