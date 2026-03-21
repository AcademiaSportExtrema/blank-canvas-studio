

## Investigação: Email automático após upload parou de funcionar

### Descobertas

1. **Sem logs da função `send-analise-email`** — A função nunca é chamada com sucesso. Zero logs encontrados.

2. **Sem registros de dedup** — A tabela `system_settings` não tem nenhum registro `email_sent_*`, confirmando que nenhum email foi enviado com sucesso por essa via.

3. **Análises estão sendo geradas** — A tabela `analise_ia` tem registros recentes (último: 2026-03-21), então o `ai-analista` funciona.

4. **Destinatários configurados** — Existem 3 emails ativos na `analise_email_config`.

### Causa raiz

O problema está na **arquitetura de streaming** do `ai-analista`. O envio do email acontece DENTRO do callback `ReadableStream.start()`, **após ler todo o stream**. Porém:

- O `Upload.tsx` chama o `ai-analista` com `fetch(...).catch(() => {})` — **não consome o body da resposta**
- O edge function runtime pode encerrar a execução antes de o stream completar e o código de email ser alcançado
- Mesmo que o stream complete, o `triggerAnaliseEmailDispatch` é uma chamada `await` dentro do stream controller — se o runtime já cortou a conexão, essa chamada nunca executa

Em resumo: **o email dispatch nunca chega a executar porque o stream é abandonado pelo cliente antes de completar**.

### Solução

Mover a lógica de disparo de email para FORA do stream — disparar o email de forma independente após salvar a análise, sem depender do stream ser consumido. Duas opções:

**Opção A (recomendada)**: Separar o fluxo — o `Upload.tsx` faz duas chamadas sequenciais:
1. Chama `ai-analista` (sem `trigger_email`)
2. Após a análise ser salva, chama `send-analise-email` diretamente

**Opção B**: No `ai-analista`, coletar o conteúdo completo primeiro (sem streaming para o Upload), salvar no DB, disparar o email, e só então retornar a resposta. Quando chamado pelo Upload, não precisa de streaming.

### Plano de implementação (Opção A)

**1. Editar `src/pages/Upload.tsx`**
- Após chamar `ai-analista`, adicionar uma segunda chamada para `send-analise-email` com `{ empresa_id, _internal: true }`
- Usar o service key não é possível do client, então: chamar com o token do usuário (sem `_internal`) — o `send-analise-email` já suporta auth por header

**2. Editar `supabase/functions/ai-analista/index.ts`**
- Remover o parâmetro `trigger_email` e toda a lógica de `triggerAnaliseEmailDispatch` de dentro do stream
- O email agora será responsabilidade do caller (Upload.tsx)

**3. Editar `src/pages/Upload.tsx`**
- Após o fetch do `ai-analista` (aguardando pelo menos que o request inicie), fazer um `setTimeout` ou `Promise` para chamar `send-analise-email` após ~10 segundos (tempo suficiente para a análise ser salva)
- Ou: usar a abordagem de polling — verificar se `analise_ia` tem um registro recente e então disparar o email

**Alternativa mais simples (Opção B — preferida)**:
- No `ai-analista`, quando `trigger_email: true`, NÃO usar streaming — coletar a resposta completa da IA, salvar, disparar email, e retornar JSON simples
- Quando chamado pelo Dashboard (AnalistaIaCard), continuar usando streaming normalmente

### Arquivos afetados
- `supabase/functions/ai-analista/index.ts` — adicionar modo não-streaming quando `trigger_email: true`
- `src/pages/Upload.tsx` — possivelmente ajustar como consome a resposta

