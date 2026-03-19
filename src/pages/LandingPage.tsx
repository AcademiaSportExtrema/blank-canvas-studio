import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Upload,
  Target,
  Trophy,
  FileText,
  Building2,
  Brain,
  ShieldCheck,
  ChevronDown,
  Check,
  Menu,
  X,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ─── Landing-specific tokens (scoped, won't leak into the app) ─── */
const COLORS = {
  bg: "bg-[hsl(240,10%,4%)]",
  bgCard: "bg-[hsl(240,6%,9%)]",
  bgCardHover: "hover:bg-[hsl(240,6%,12%)]",
  border: "border-[hsl(240,6%,15%)]",
  accent: "text-[hsl(174,72%,56%)]",
  accentBg: "bg-[hsl(174,72%,56%)]",
  accentBgHover: "hover:bg-[hsl(174,72%,48%)]",
  accentBorder: "border-[hsl(174,72%,56%)]",
  accentGlow: "shadow-[0_0_40px_-12px_hsl(174,72%,56%,0.35)]",
  textPrimary: "text-white",
  textSecondary: "text-[hsl(240,5%,65%)]",
  textMuted: "text-[hsl(240,5%,45%)]",
};

/* ─── Data ─── */

const FEATURES_MAIN = [
  {
    icon: BarChart3,
    title: "Pare de adivinhar se vai bater a meta",
    description:
      "Veja o progresso do time em tempo real e aja antes de perder a semana. Sem esperar o fechamento do mês.",
  },
  {
    icon: Brain,
    title: "Cada consultora melhora sozinha",
    description:
      "Dicas personalizadas baseadas no histórico de cada uma. O time se motiva sozinho — você só acompanha os resultados.",
  },
];

const FEATURES_GRID = [
  {
    icon: Upload,
    title: "10 segundos para importar",
    description: "Importe a planilha do ERP sem digitação e sem erro humano. O sistema classifica tudo.",
  },
  {
    icon: Target,
    title: "Comissões no automático",
    description: "Configure faixas uma vez. O sistema calcula quanto cada consultora ganha.",
  },
  {
    icon: Trophy,
    title: "O time se cobra sozinho",
    description: "Ranking visível = competição saudável sem você precisar pressionar ninguém.",
  },
  {
    icon: ShieldCheck,
    title: "Nunca mais perca dinheiro",
    description: "Saiba quem deve, quanto e há quantos dias. Cobrança organizada sem planilha.",
  },
  {
    icon: FileText,
    title: "Fechamento em 1 clique",
    description: "Relatório de caixa pronto para contabilidade ou diretoria. Exporta na hora.",
  },
  {
    icon: Building2,
    title: "2 lojas ou 50, tudo junto",
    description: "Cada unidade isolada, você vê tudo em um só painel.",
  },
];

const FEATURES_LIST = [
  "Dashboard completo em tempo real",
  "Upload e importação de planilhas",
  "Metas, comissões e ranking",
  "IA Coach personalizado",
  "Análise automática por IA",
  "Gestão de devedores",
  "Relatórios avançados",
  "Multi-empresa (SaaS)",
  "Suporte prioritário",
];

const PLANS = [
  {
    name: "Mensal",
    priceLabel: "R$ 297",
    priceSuffix: "/mês",
    subtitle: "Cobrança mensal, cancele quando quiser",
    features: FEATURES_LIST,
    highlighted: false,
  },
  {
    name: "Anual",
    priceLabel: "R$ 3.024",
    priceSuffix: "/ano à vista",
    subtitle: "Equivale a R$ 252/mês — economia de 15%",
    badge: "-15%",
    features: FEATURES_LIST,
    highlighted: true,
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Antes eu só sabia se tinha batido a meta no dia 5 do mês seguinte. Agora acompanho em tempo real e consigo agir na hora certa. Resultado: 3 meses seguidos acima da meta.",
    author: "Carla Mendes",
    role: "Gerente Comercial — Beleza Pura",
  },
  {
    quote:
      "O ranking mudou o clima do time. As consultoras começaram a se cobrar sozinhas. Em 60 dias, a equipe aumentou o faturamento em 22%.",
    author: "Ricardo Alves",
    role: "Diretor — Rede FitClub",
  },
];

const FAQ_ITEMS = [
  {
    q: "Preciso instalar algum software?",
    a: "Não. O MetasHub é 100% web. Basta acessar pelo navegador em qualquer dispositivo — computador, tablet ou celular.",
  },
  {
    q: "Como funciona a importação de dados?",
    a: "Você exporta a planilha do seu ERP (formato XLS) e faz o upload diretamente na plataforma. O sistema aplica regras automáticas para classificar cada lançamento.",
  },
  {
    q: "Como solicito o cadastro?",
    a: "Basta clicar em 'Solicitar cadastro' e preencher o formulário. Nossa equipe entrará em contato para liberar seu acesso.",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Totalmente. Usamos criptografia de ponta a ponta, isolamento por empresa e backups diários. Toda a infraestrutura roda em servidores seguros.",
  },
  {
    q: "Posso gerenciar mais de uma loja?",
    a: "Sim, você gerencia múltiplas unidades em uma única plataforma, com dados totalmente isolados entre elas.",
  },
];

const NAV_LINKS = [
  { label: "Recursos", href: "#recursos" },
  { label: "FAQ", href: "#faq" },
];

/* ─── Components ─── */

const LandingPage = () => {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className={`min-h-screen ${COLORS.bg} ${COLORS.textPrimary} overflow-x-hidden`}>
      {/* ══════ NAVBAR ══════ */}
      <nav className={`fixed top-0 inset-x-0 z-50 ${COLORS.bg}/80 backdrop-blur-lg ${COLORS.border} border-b`}>
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-[hsl(174,72%,56%)]" />
            <span className="text-xl font-bold tracking-tight">MetasHub</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className={`text-sm ${COLORS.textSecondary} hover:text-white transition`}>
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="text-sm text-white hover:bg-white/10" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button className={`${COLORS.accentBg} ${COLORS.accentBgHover} text-black font-semibold text-sm`} asChild>
              <Link to="/cadastro">Solicitar cadastro</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-white" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className={`md:hidden ${COLORS.bg} border-t ${COLORS.border} px-6 py-4 space-y-4`}>
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`block text-sm ${COLORS.textSecondary} hover:text-white`}
                onClick={() => setMobileMenu(false)}
              >
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" className="border-white/20 text-white" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button className={`${COLORS.accentBg} text-black font-semibold`} asChild>
                <Link to="/cadastro">Solicitar cadastro</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* ══════ HERO ══════ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6">
        {/* Gradient orb */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(174,72%,56%)] opacity-[0.07] blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${COLORS.bgCard} ${COLORS.border} border text-xs ${COLORS.textSecondary} mb-8`}>
            <Sparkles className="h-3.5 w-3.5 text-[hsl(174,72%,56%)]" />
            Gestão de metas comerciais simplificada
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Sua equipe vendendo mais.{" "}
            <span className="bg-gradient-to-r from-[hsl(174,72%,56%)] to-[hsl(199,89%,48%)] bg-clip-text text-transparent">
              Todo mês.
            </span>
          </h1>

          <p className={`text-lg md:text-xl ${COLORS.textSecondary} max-w-2xl mx-auto mb-10 leading-relaxed`}>
            Chega de planilhas perdidas e metas batidas no escuro. Veja quem está performando, quem precisa de ajuda e quanto falta — tudo em tempo real.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className={`${COLORS.accentBg} ${COLORS.accentBgHover} text-black font-semibold text-base px-8 ${COLORS.accentGlow}`}
              asChild
            >
              <Link to="/cadastro">
                Solicitar cadastro
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-white/90 text-base px-8"
              asChild
            >
              <a href="#recursos">Ver recursos</a>
            </Button>
          </div>
        </div>
      </section>


      {/* ══════ MAIN FEATURES ══════ */}
      <section id="recursos" className="px-6 pb-20 scroll-mt-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            O que muda no seu dia a dia
          </h2>
          <p className={`text-center ${COLORS.textSecondary} mb-12 max-w-xl mx-auto`}>
            Menos planilha, mais resultado. Veja como o MetasHub resolve seus maiores problemas.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES_MAIN.map((f) => (
              <div
                key={f.title}
                className={`${COLORS.bgCard} ${COLORS.border} border rounded-2xl p-8 ${COLORS.bgCardHover} transition group`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${COLORS.accentBg}/10 mb-5`}>
                  <f.icon className="h-6 w-6 text-[hsl(174,72%,56%)]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className={`${COLORS.textSecondary} leading-relaxed`}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FEATURES GRID ══════ */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES_GRID.map((f) => (
            <div
              key={f.title}
              className={`${COLORS.bgCard} ${COLORS.border} border rounded-xl p-6 ${COLORS.bgCardHover} transition`}
            >
              <f.icon className="h-5 w-5 text-[hsl(174,72%,56%)] mb-4" />
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className={`text-sm ${COLORS.textSecondary} leading-relaxed`}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ PRICING ══════ */}
      <section id="precos" className="px-6 pb-20 scroll-mt-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Comece a ver resultados em menos de 7 dias
          </h2>
          <p className={`text-center ${COLORS.textSecondary} mb-8 max-w-xl mx-auto`}>
            Teste grátis por 30 dias. Sem cartão de crédito, sem compromisso.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border transition ${
                  plan.highlighted
                    ? `${COLORS.accentBorder} ${COLORS.bgCard} ${COLORS.accentGlow}`
                    : `${COLORS.border} ${COLORS.bgCard}`
                }`}
              >
                {"badge" in plan && plan.badge && (
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${COLORS.accentBg} text-black mb-4`}>
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className={`text-sm ${COLORS.textSecondary} mb-5`}>{plan.subtitle}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.priceLabel}</span>
                  <span className={`text-sm ${COLORS.textSecondary}`}>{plan.priceSuffix}</span>
                </div>

                <Button
                  className={`w-full mb-6 ${
                    plan.highlighted
                      ? `${COLORS.accentBg} ${COLORS.accentBgHover} text-black font-semibold`
                      : "bg-white/10 hover:bg-white/15 text-white"
                  }`}
                  asChild
                >
                  <Link to="/cadastro">Teste grátis — 30 dias</Link>
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-[hsl(174,72%,56%)] mt-0.5 shrink-0" />
                      <span className={COLORS.textSecondary}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ TESTIMONIALS ══════ */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.author}
              className={`${COLORS.bgCard} ${COLORS.border} border rounded-2xl p-8`}
            >
              <p className={`${COLORS.textSecondary} leading-relaxed mb-6 italic`}>"{t.quote}"</p>
              <div>
                <div className="font-semibold text-sm">{t.author}</div>
                <div className={`text-xs ${COLORS.textMuted}`}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ FAQ ══════ */}
      <section id="faq" className="px-6 pb-20 scroll-mt-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Perguntas frequentes
          </h2>

          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className={`${COLORS.bgCard} ${COLORS.border} border rounded-xl px-6 overflow-hidden`}
              >
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-5">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className={`text-sm ${COLORS.textSecondary} pb-5`}>
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ══════ CTA FINAL ══════ */}
      <section className="px-6 pb-20">
        <div className={`mx-auto max-w-4xl rounded-3xl ${COLORS.bgCard} ${COLORS.border} border p-12 md:p-16 text-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(174,72%,56%,0.08)] to-transparent pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Você está a 30 dias de ter uma equipe que bate meta sozinha
            </h2>
            <p className={`${COLORS.textSecondary} mb-8 max-w-lg mx-auto`}>
              Comece agora, sem cartão de crédito. Veja os resultados antes de pagar.
            </p>
            <Button
              size="lg"
              className={`${COLORS.accentBg} ${COLORS.accentBgHover} text-black font-semibold text-base px-10 ${COLORS.accentGlow}`}
              asChild
            >
              <Link to="/cadastro">
                Teste grátis — 30 dias
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer className={`border-t ${COLORS.border} px-6 py-12`}>
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[hsl(174,72%,56%)]" />
            <span className="font-bold">MetasHub</span>
          </div>

          <div className={`flex items-center gap-6 text-sm ${COLORS.textSecondary}`}>
            <a href="#recursos" className="hover:text-white transition">Recursos</a>
            <a href="#precos" className="hover:text-white transition">Preços</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
            <Link to="/login" className="hover:text-white transition">Login</Link>
          </div>

          <div className={`text-xs ${COLORS.textMuted}`}>
            © {new Date().getFullYear()} MetasHub. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
