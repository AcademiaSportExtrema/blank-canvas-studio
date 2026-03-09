

## Alterações na Tabela de Fechamento de Caixa

### 1. Letras de referência nas colunas
Adicionar uma linha extra no `TableHeader` com letras (A, B, C, D...) acima dos nomes das colunas para facilitar referência, como numa planilha.

### 2. Coluna "Acumulado" após "Total"
Inserir uma coluna que acumula o total dia a dia (soma progressiva). Cada linha mostra a soma do Total daquele dia + todos os dias anteriores do mês.

### 3. Verificar coluna Total
A coluna Total atual soma corretamente todos os `PAYMENT_COLS` por dia (`dayTotal += v` para cada forma de pagamento). Está correto.

### 4. Exportar para Excel (.xlsx)
Trocar o botão CSV por um exportador Excel. Como não temos dependência de xlsx no projeto, vou usar a mesma função `exportToCSV` mas com extensão `.xls` e content-type do Excel (CSV com BOM abre corretamente no Excel), **ou** adicionar a coluna Acumulado ao export CSV existente e manter o botão como "Excel" (CSV com separador `;` e BOM já é compatível com Excel). Incluir a nova coluna Acumulado no export.

### Arquivos alterados
- **`src/components/relatorios/FechamentoCaixaTable.tsx`**:
  - Nova linha de cabeçalho com letras A, B, C...
  - Nova coluna "Acumulado" após "Total" (no header, body, footer e export)
  - Botão "Excel" no lugar de "CSV" (mesma função, extensão `.xls`)

