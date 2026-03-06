

## Diagnóstico

O hash de deduplicação na Edge Function `upload-importar-xls` usa apenas estes campos:

```
empresa | matricula | produto | data_lancamento | valor | resp_venda | numero_contrato
```

**`forma_pagamento` e `condicao_pagamento` NÃO fazem parte do hash.** Isso significa que se o mesmo contrato aparece duas vezes no Excel com formas de pagamento diferentes (ex: "CARTÃO RECORRENTE" e "PIX INTER"), a segunda linha é descartada como duplicata, pois gera o mesmo hash.

Nos dados do dia 05/03, vários contratos têm uma entrada com `forma_pagamento = "PIX INTER"` que foi importada, enquanto a entrada correspondente com `forma_pagamento = "CARTÃO RECORRENTE"` (valor 149,00) foi ignorada como duplicata.

## Plano

### 1. Corrigir o hash de deduplicação

Adicionar `forma_pagamento` à string do hash na Edge Function, para que linhas com mesmos dados mas formas de pagamento diferentes sejam tratadas como registros distintos.

Linha 152 do `upload-importar-xls/index.ts`:
```typescript
// Antes:
const hashStr = `${lancamento.empresa}|${lancamento.matricula}|${lancamento.produto}|${lancamento.data_lancamento}|${lancamento.valor}|${lancamento.resp_venda}|${lancamento.numero_contrato}`;

// Depois:
const hashStr = `${lancamento.empresa}|${lancamento.matricula}|${lancamento.produto}|${lancamento.data_lancamento}|${lancamento.valor}|${lancamento.resp_venda}|${lancamento.numero_contrato}|${lancamento.forma_pagamento}`;
```

### 2. Reprocessar o upload do dia 05/03

Após o deploy da função corrigida, o usuário precisará re-importar o arquivo do dia 05/03 para que a parcela de 149,00 com "CARTÃO RECORRENTE" seja processada (as linhas já existentes serão ignoradas como duplicatas, e as novas serão importadas).

### Arquivos alterados
- `supabase/functions/upload-importar-xls/index.ts` -- adicionar forma_pagamento ao hash

