import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("resend");

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    // 1. Mark active empresas with proximo_vencimento < today as past_due
    const { data: overdue } = await supabase
      .from("empresas")
      .select("id, nome, proximo_vencimento, financeiro_email, financeiro_nome")
      .eq("subscription_status", "active")
      .lt("proximo_vencimento", today);

    if (overdue && overdue.length > 0) {
      const ids = overdue.map((e: any) => e.id);
      await supabase
        .from("empresas")
        .update({ subscription_status: "past_due" })
        .in("id", ids);
      console.log(`Marked ${ids.length} empresas as past_due`);
    }

    // 2. Mark expired trials as past_due
    const { data: expiredTrials } = await supabase
      .from("empresas")
      .select("id")
      .eq("subscription_status", "trialing")
      .lt("trial_ends_at", now.toISOString());

    if (expiredTrials && expiredTrials.length > 0) {
      const ids = expiredTrials.map((e: any) => e.id);
      await supabase
        .from("empresas")
        .update({ subscription_status: "past_due" })
        .in("id", ids);
      console.log(`Marked ${ids.length} expired trials as past_due`);
    }

    // 3. Cancel empresas past_due for more than 30 days
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: longOverdue } = await supabase
      .from("empresas")
      .select("id, proximo_vencimento")
      .eq("subscription_status", "past_due")
      .lt("proximo_vencimento", thirtyDaysAgo.toISOString().split("T")[0]);

    if (longOverdue && longOverdue.length > 0) {
      const ids = longOverdue.map((e: any) => e.id);
      await supabase
        .from("empresas")
        .update({ subscription_status: "canceled", ativo: false })
        .in("id", ids);
      console.log(`Canceled ${ids.length} empresas past_due > 30 days`);
    }

    // 4. Send email notifications if Resend is configured
    if (resendKey) {
      // Get all active empresas for notification checks
      const { data: allEmpresas } = await supabase
        .from("empresas")
        .select("id, nome, proximo_vencimento, financeiro_email, financeiro_nome, subscription_status, valor_mensal")
        .in("subscription_status", ["active", "past_due"])
        .not("financeiro_email", "is", null);

      if (allEmpresas) {
        const mesRef = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        for (const empresa of allEmpresas) {
          if (!empresa.proximo_vencimento || !empresa.financeiro_email) continue;

          const vencDate = new Date(empresa.proximo_vencimento + "T00:00:00");
          const diffDays = Math.round((vencDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          let tipo: string | null = null;
          let assunto = "";
          let corpo = "";

          if (diffDays === 5) {
            tipo = "lembrete";
            assunto = `Lembrete: sua assinatura vence em 5 dias`;
            corpo = `Olá ${empresa.financeiro_nome ?? empresa.nome}, sua assinatura no valor de R$ ${empresa.valor_mensal?.toFixed(2)} vence em ${empresa.proximo_vencimento}. Por favor, providencie o pagamento para evitar interrupções.`;
          } else if (diffDays === 0) {
            tipo = "cobranca";
            assunto = `Sua assinatura vence hoje`;
            corpo = `Olá ${empresa.financeiro_nome ?? empresa.nome}, sua assinatura no valor de R$ ${empresa.valor_mensal?.toFixed(2)} vence hoje (${empresa.proximo_vencimento}). Realize o pagamento para manter o acesso ativo.`;
          } else if (diffDays === -3) {
            tipo = "atraso";
            assunto = `Assinatura em atraso — ação necessária`;
            corpo = `Olá ${empresa.financeiro_nome ?? empresa.nome}, sua assinatura está em atraso desde ${empresa.proximo_vencimento}. O valor pendente é de R$ ${empresa.valor_mensal?.toFixed(2)}. Regularize para evitar o cancelamento do acesso.`;
          }

          if (!tipo) continue;

          // Check if already sent for this cycle
          const { data: existing } = await supabase
            .from("notificacoes_cobranca")
            .select("id")
            .eq("empresa_id", empresa.id)
            .eq("tipo", tipo)
            .eq("mes_referencia", mesRef)
            .maybeSingle();

          if (existing) continue;

          // Send email via Resend
          try {
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "MetasHUB <noreply@metashub.com.br>",
                to: [empresa.financeiro_email],
                subject: assunto,
                html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px"><h2>${assunto}</h2><p>${corpo}</p><br><p style="color:#888;font-size:12px">MetasHUB — Gestão de Metas</p></div>`,
              }),
            });

            if (res.ok) {
              await supabase.from("notificacoes_cobranca").insert({
                empresa_id: empresa.id,
                tipo,
                mes_referencia: mesRef,
              });
              console.log(`Sent ${tipo} email to ${empresa.financeiro_email} for ${empresa.nome}`);
            } else {
              const errText = await res.text();
              console.error(`Resend error for ${empresa.nome}: ${errText}`);
            }
          } catch (emailErr) {
            console.error(`Email send error for ${empresa.nome}:`, emailErr);
          }
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, date: today }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("check-vencimentos error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
