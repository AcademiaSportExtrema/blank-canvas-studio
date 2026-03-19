import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { nome, email, telefone, nome_empresa, segmento, qtd_consultoras, como_conheceu } = body;

    // Validate required fields
    if (!nome || !email || !nome_empresa) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios: nome, email, nome_empresa' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Sanitize & validate lengths
    const sanitize = (val: string | undefined, max: number) =>
      val ? val.trim().slice(0, max) : null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return new Response(JSON.stringify({ error: 'Email inválido' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check for duplicate email
    const { data: existing } = await supabaseAdmin
      .from('site_leads')
      .select('id, status')
      .eq('email', email.trim().toLowerCase())
      .in('status', ['novo'])
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ error: 'Já existe uma inscrição pendente com este email' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { error: insertError } = await supabaseAdmin
      .from('site_leads')
      .insert({
        nome: sanitize(nome, 100)!,
        email: email.trim().toLowerCase().slice(0, 255),
        telefone: sanitize(telefone, 20),
        nome_empresa: sanitize(nome_empresa, 100)!,
        segmento: sanitize(segmento, 100),
        qtd_consultoras: sanitize(qtd_consultoras, 20),
        como_conheceu: sanitize(como_conheceu, 200),
        status: 'novo',
      });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Erro ao salvar lead:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
