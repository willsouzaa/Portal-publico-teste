import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, email, telefone, mensagem, empreendimento_id, empreendimento_nome } = body

    // Validação básica
    if (!nome || !email || !telefone || !empreendimento_id) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient({ schema: "public" })

    // Inserir lead na tabela
    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          nome,
          email,
          telefone,
          mensagem,
          empreendimento_id,
          empreendimento_nome,
          origem: "portal_publico",
          status: "novo",
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error("Erro ao salvar lead:", error)
      return NextResponse.json(
        { error: "Erro ao salvar lead" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error("Erro no endpoint de leads:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
