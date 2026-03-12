

## Controle de Consumo de IA por Tenant

### Problema
Hoje as funções `ai-coach` e `ai-analista` chamam o Lovable AI Gateway sem registrar nenhum dado de uso. Não há como saber qual empresa consome mais tokens, nem limitar uso abusivo.

### Solução

**1. Nova tabela `ai_usage_logs`**

Registra cada chamada de IA com empresa, função, e tokens estimados.

```sql
CREATE TABLE public.ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  funcao text NOT NULL,          -- 'ai-coach', 'ai-analista'
  user_id uuid,
  tokens_estimados integer NOT NULL DEFAULT 0,
  modelo text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Super admins veem tudo, admins veem da própria empresa
CREATE POLICY "Super admins full access ai_usage_logs"
  ON public.ai_usage_logs FOR ALL TO public
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins read own empresa ai_usage_logs"
  ON public.ai_usage_logs FOR SELECT TO public
  USING (has_role(auth.uid(), 'admin') AND empresa_id = get_user_empresa_id(auth.uid()));
```

**2. Atualizar `ai-coach/index.ts` e `ai-analista/index.ts`**

Após receber a resposta da IA, coletar o `usage` do response (ou estimar tokens pelo tamanho do texto) e inserir na tabela usando service role client:

```ts
// Após processar o stream, estimar tokens e salvar
const tokensEstimados = Math.ceil(fullContent.length / 4);
const serviceSupabase = createClient(supabaseUrl, serviceKey);
await serviceSupabase.from("ai_usage_logs").insert({
  empresa_id: empresaId,
  funcao: "ai-analista", // ou "ai-coach"
  user_id: userId,
  tokens_estimados: tokensEstimados,
  modelo: "google/gemini-3-flash-preview"
});
```

Para o `ai-coach` (que retorna stream direto), interceptar o stream para coletar o conteúdo completo antes de salvar (similar ao padrão já usado no `ai-analista`).

**3. Painel de uso no Super Admin**

Adicionar uma nova aba "Uso IA" no `SaasAdmin.tsx` com:
- Tabela de uso agregado por empresa (total tokens, total chamadas, último uso)
- Filtro por período (mês)
- Gráfico de barras por empresa usando Recharts

**4. Visão do Admin da empresa**

Na página de Configuração, adicionar card simples mostrando o consumo do mês atual da empresa.

### Arquivos alterados
- **Nova migração SQL**: tabela `ai_usage_logs`
- `supabase/functions/ai-analista/index.ts`: salvar uso após stream
- `supabase/functions/ai-coach/index.ts`: interceptar stream, salvar uso
- `src/pages/super-admin/SaasAdmin.tsx`: nova aba "Uso IA"
- Novo componente `src/components/super-admin/UsoIaContent.tsx`: tabela + gráfico
- `src/pages/Configuracao.tsx`: card de consumo do mês

