import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Target, User, Mail, Phone, Building, Users, Megaphone, AlertCircle, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const STEPS = ['Seus dados', 'Sobre a empresa', 'Como nos conheceu'];

export default function Cadastro() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [segmento, setSegmento] = useState('');
  const [qtdConsultoras, setQtdConsultoras] = useState('');
  const [comoConheceu, setComoConheceu] = useState('');

  const progress = ((step + 1) / STEPS.length) * 100;

  const canAdvance = () => {
    if (step === 0) return nome.trim() && email.trim();
    if (step === 1) return nomeEmpresa.trim();
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('submit-site-lead', {
        body: {
          nome: nome.trim(),
          email: email.trim(),
          telefone: telefone.trim() || undefined,
          nome_empresa: nomeEmpresa.trim(),
          segmento: segmento || undefined,
          qtd_consultoras: qtdConsultoras || undefined,
          como_conheceu: comoConheceu.trim() || undefined,
        },
      });

      if (fnError) throw fnError;
      if (data?.error) {
        setError(data.error);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar inscrição. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setError(null);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar p-4">
        <Card className="w-full max-w-md border-sidebar-border">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 mb-4">
                <CheckCircle className="h-7 w-7 text-success" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Inscrição enviada!</h2>
              <p className="text-muted-foreground mb-6">
                Recebemos sua solicitação. Nossa equipe analisará seus dados e entrará em contato em breve pelo email <strong>{email}</strong>.
              </p>
              <Button asChild variant="outline">
                <Link to="/">Voltar ao site</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground mb-4">
            <Target className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-sidebar-foreground">MetasHUB</h1>
          <p className="text-sidebar-foreground/60 mt-1">Solicite seu acesso</p>
        </div>

        <Card className="border-sidebar-border">
          <CardHeader className="space-y-3">
            <div className="space-y-1">
              <CardTitle className="text-xl">Inscrição — Etapa {step + 1}/{STEPS.length}</CardTitle>
              <CardDescription>{STEPS[step]}</CardDescription>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {step === 0 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="nome" placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} className="pl-10" required maxLength={100} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required maxLength={255} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="telefone" placeholder="(00) 00000-0000" value={telefone} onChange={e => setTelefone(e.target.value)} className="pl-10" maxLength={20} />
                    </div>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nomeEmpresa">Nome da empresa *</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="nomeEmpresa" placeholder="Nome da sua empresa" value={nomeEmpresa} onChange={e => setNomeEmpresa(e.target.value)} className="pl-10" required maxLength={100} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="segmento">Segmento</Label>
                    <Select value={segmento} onValueChange={setSegmento}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o segmento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academia">Academia / Fitness</SelectItem>
                        <SelectItem value="educacao">Educação</SelectItem>
                        <SelectItem value="saude">Saúde / Clínica</SelectItem>
                        <SelectItem value="varejo">Varejo</SelectItem>
                        <SelectItem value="servicos">Serviços</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qtdConsultoras">Quantas consultoras/vendedoras?</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Select value={qtdConsultoras} onValueChange={setQtdConsultoras}>
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-5">1 a 5</SelectItem>
                          <SelectItem value="6-15">6 a 15</SelectItem>
                          <SelectItem value="16-30">16 a 30</SelectItem>
                          <SelectItem value="30+">Mais de 30</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="space-y-2">
                  <Label htmlFor="comoConheceu">Como conheceu o MetasHUB?</Label>
                  <div className="relative">
                    <Megaphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="comoConheceu" placeholder="Ex: indicação, Google, redes sociais..." value={comoConheceu} onChange={e => setComoConheceu(e.target.value)} className="pl-10" maxLength={200} />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {step > 0 && (
                  <Button type="button" variant="outline" className="flex-1" onClick={() => { setStep(step - 1); setError(null); }}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
                  </Button>
                )}
                <Button type="button" className="flex-1" disabled={!canAdvance() || isLoading} onClick={handleNext}>
                  {step < STEPS.length - 1 ? (
                    <>Próximo <ArrowRight className="h-4 w-4 ml-1" /></>
                  ) : isLoading ? 'Enviando...' : 'Enviar inscrição'}
                </Button>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary hover:underline">Faça login</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
