
## O que o usuário quer

Simplificar a seção de preços para ter **1 único plano** com dois valores:
- **R$ 297,00/mês** (mensal)
- **R$ 252,45/mês** cobrado anualmente (15% de desconto = R$ 297 × 0,85 ≈ **R$ 252**/mês, ou seja, **R$ 3.029/ano**)

### Impacto nos arquivos

**1. `src/pages/LandingPage.tsx`** — Seção de preços
- Remover os 3 planos atuais (Starter R$197, Pro R$397, Enterprise sob consulta)
- Criar 1 único plano centralizado com toggle mensal/anual
- Layout: card único centralizado e destacado (com borda ciano + glow), similar ao card "Pro" atual
- Features: listar todos os recursos inclusos (tudo do sistema)
- Manter toggle Mensal/Anual com badge "-15%"

**2. `src/components/super-admin/FinanceiroContent.tsx`** — Campo de plano exibido no sistema interno
- Onde aparece "Starter" / "Pro" / "Enterprise", simplificar o badge/texto para mostrar apenas "Padrão" ou o valor cadastrado
- O campo `valor_mensal` em cada empresa já é livre, então não muda lógica, apenas referências visuais a nomes de plano antigos

**3. `src/pages/super-admin/NovaEmpresa.tsx`** *(opcional, baixa prioridade)*
- Se houver um select de plano, atualizar — mas pela leitura do código não há campo de plano no formulário, apenas `valor_mensal` livre, então nada muda aqui

### Layout do novo card de preços

```text
        ┌──────────────────────────────────┐
        │         [toggle Mensal/Anual]    │
        │                                  │
        │  ┌────────────────────────────┐  │
        │  │  MetasHub Pro              │  │
        │  │  Plataforma completa       │  │
        │  │                            │  │
        │  │  R$ 297 /mês               │  │
        │  │  [Se anual: R$ 252/mês]    │  │
        │  │  [Se anual: cobrado anual] │  │
        │  │                            │  │
        │  │  [Começar grátis - 14 dias]│  │
        │  │                            │  │
        │  │  ✓ Dashboard completo      │  │
        │  │  ✓ Upload de planilhas     │  │
        │  │  ✓ Metas e comissões       │  │
        │  │  ✓ Ranking de consultoras  │  │
        │  │  ✓ IA Coach personalizado  │  │
        │  │  ✓ Análise automática IA   │  │
        │  │  ✓ Gestão de devedores     │  │
        │  │  ✓ Relatórios avançados    │  │
        │  │  ✓ Suporte prioritário     │  │
        │  └────────────────────────────┘  │
        └──────────────────────────────────┘
```

### Cálculo do desconto anual
- Mensal: R$ 297,00/mês
- Anual: R$ 297 × 0,85 = **R$ 252,45/mês** → arredondado para **R$ 252/mês**
- Total anual: R$ 252 × 12 = **R$ 3.024/ano**

### Arquivos a editar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/LandingPage.tsx` | Substituir array `PLANS` por 1 plano único (R$ 297 / R$ 252) e ajustar o grid de 3 colunas para centralizado |
| `src/components/super-admin/FinanceiroContent.tsx` | Remover referências visuais a "Starter"/"Pro"/"Enterprise" se houver filtro ou badge por nome de plano |
