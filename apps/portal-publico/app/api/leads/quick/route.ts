import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, contato, canal, is_draft, draft_token } = body;

    // basic validation: at least nome or contato
    if (!nome && !contato) {
      return NextResponse.json({ error: 'Missing nome or contato' }, { status: 400 });
    }

    const supabase = createSupabaseServerClient({ schema: 'public' });

    // If draft_token provided, try update
    if (draft_token) {
      const isDraft = Boolean(is_draft);
      const status = isDraft ? 'rascunho' : 'novo';
      const { data, error } = await supabase
        .from('leads')
        .update({ nome, telefone: contato, canal, is_draft: isDraft, status, updated_at: new Date().toISOString() })
        .eq('id', draft_token)
        .select()
        .single();

      if (error) {
        console.error('Error updating draft lead', error);
        // fallback to insert
      } else {
        return NextResponse.json({ success: true, data }, { status: 200 });
      }
    }

    // Insert new record (draft or final submission)
    const isDraftInsert = Boolean(is_draft);
    const insertStatus = isDraftInsert ? 'rascunho' : 'novo';
    const { data, error } = await supabase
      .from('leads')
      .insert([{ nome, telefone: contato, canal, is_draft: isDraftInsert, origem: 'portal_publico', status: insertStatus, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      console.error('Error inserting draft lead', error);
      return NextResponse.json({ error: 'Error saving draft' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error('Error in quick lead endpoint', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
