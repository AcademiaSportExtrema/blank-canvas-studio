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
const SCREENSHOTS = [
  { src: "/screenshots/dashboard.png", label: "Dashboard completo" },
  { src: "/screenshots/dashboard.png", label: "Gestão de Metas" },
  { src: "/screenshots/dashboard.png", label: "Rankings e Performance" },
  { src: "/screenshots/dashboard.png", label: "Relatórios detalhados" },
];

const FEATURES_MAIN = [
  {
    icon: BarChart3,
    title: "Dashboard inteligente",
    description:
      "Visualize receita, ticket médio, ranking e tendências em tempo real. Gráficos interativos que transformam dados em decisões.",
  },
  {
    icon: Brain,
    title: "IA Coach personalizado",
    description:
      "Inteligência artificial que analisa o desempenho e gera dicas diárias para cada consultora alcançar suas metas.",
  },
];

const FEATURES_GRID = [
  {
    icon: Upload,
    title: "Upload automático",
    description: "Importe planilhas XLS do ERP e o sistema classifica tudo automaticamente com regras configuráveis.",
  },
  {
    icon: Target,
    title: "Metas por nível",
    description: "Defina faixas de comissão, metas semanais e distribua pesos por consultora com total flexibilidade.",
  },
  {
    icon: Trophy,
    title: "Ranking & gamificação",
    description: "Ranking em tempo real com medalhas. Engaje o time com competição saudável e transparência.",
  },
  {
    icon: ShieldCheck,
    title: "Gestão de devedores",
    description: "Controle parcelas vencidas, registre cobranças e acompanhe o status de pagamento de cada cliente.",
  },
  {
    icon: FileText,
    title: "Relatórios completos",
    description: "Fechamento de caixa, meta anual e relatórios exportáveis para análises estratégicas.",
  },
  {
    icon: Building2,
    title: "Multi-empresa (SaaS)",
    description: "Gerencie várias unidades em uma única plataforma com isolamento total de dados e usuários.",
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
      "O MetasHub transformou a forma como acompanhamos nossas metas. Antes era tudo em planilha, agora temos visibilidade total em tempo real.",
    author: "Carla Mendes",
    role: "Gerente Comercial — Beleza Pura",
  },
  {
    quote:
      "A funcionalidade de IA Coach motivou nossas consultoras de um jeito que nunca imaginei. O time bateu a meta por 3 meses consecutivos.",
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
    q: "Posso testar antes de assinar?",
    a: "Sim! Oferecemos 30 dias de teste grátis com acesso completo a todas as funcionalidades do plano Pro.",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Totalmente. Usamos criptografia de ponta a ponta, isolamento por empresa e backups diários. Toda a infraestrutura roda em servidores seguros.",
  },
  {
    q: "Posso gerenciar mais de uma loja?",
    a: "Sim, no plano Enterprise você gerencia múltiplas unidades em uma única plataforma, com dados totalmente isolados entre elas.",
  },
];

const NAV_LINKS = [
  { label: "Recursos", href: "#recursos" },
  { label: "Preços", href: "#precos" },
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
              <Link to="/cadastro">Teste grátis — 30 dias</Link>
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
                <Link to="/cadastro">Teste grátis — 30 dias</Link>
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
            Plataforma #1 de gestão de metas comerciais
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Transforme metas em{" "}
            <span className="bg-gradient-to-r from-[hsl(174,72%,56%)] to-[hsl(199,89%,48%)] bg-clip-text text-transparent">
              resultados reais
            </span>
          </h1>

          <p className={`text-lg md:text-xl ${COLORS.textSecondary} max-w-2xl mx-auto mb-10 leading-relaxed`}>
            Dashboard inteligente, IA Coach, rankings e relatórios completos para equipes de vendas que querem bater metas todos os meses.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className={`${COLORS.accentBg} ${COLORS.accentBgHover} text-black font-semibold text-base px-8 ${COLORS.accentGlow}`}
              asChild
            >
              <Link to="/cadastro">
                Teste grátis — 30 dias
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5 text-base px-8"
              asChild
            >
              <a href="#recursos">Ver recursos</a>
            </Button>
          </div>
        </div>
      </section>

      {/* ══════ SCREENSHOTS ══════ */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Conheça o sistema
          </h2>
          <p className={`text-center ${COLORS.textSecondary} mb-10 max-w-xl mx-auto`}>
            Veja como o MetasHub funciona na prática.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SCREENSHOTS.map((s) => (
              <div
                key={s.label}
                className={`${COLORS.bgCard} ${COLORS.border} border rounded-xl overflow-hidden`}
              >
                <img
                  src={s.src}
                  alt={s.label}
                  className="w-full aspect-video object-cover"
                  loading="lazy"
                />
                <div className="p-4 text-center">
                  <span className={`text-sm font-medium ${COLORS.textSecondary}`}>{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ MAIN FEATURES ══════ */}
      <section id="recursos" className="px-6 pb-20 scroll-mt-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Tudo que você precisa em um só lugar
          </h2>
          <p className={`text-center ${COLORS.textSecondary} mb-12 max-w-xl mx-auto`}>
            Recursos pensados para gestores que precisam de agilidade, clareza e resultados.
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
            Planos que cabem no seu bolso
          </h2>
          <p className={`text-center ${COLORS.textSecondary} mb-8 max-w-xl mx-auto`}>
            Comece grátis por 14 dias. Sem cartão de crédito.
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
                  <Link to="/cadastro">Começar grátis</Link>
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
              Pronto para bater todas as metas?
            </h2>
            <p className={`${COLORS.textSecondary} mb-8 max-w-lg mx-auto`}>
              Comece grátis por 14 dias. Sem cartão de crédito, sem compromisso.
            </p>
            <Button
              size="lg"
              className={`${COLORS.accentBg} ${COLORS.accentBgHover} text-black font-semibold text-base px-10 ${COLORS.accentGlow}`}
              asChild
            >
              <Link to="/cadastro">
                Começar agora
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
