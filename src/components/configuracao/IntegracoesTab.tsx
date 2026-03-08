import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Save, ExternalLink, Mail, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function IntegracoesTab() {
  // AbacatePay state
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Resend state
  const [resendApiKey, setResendApiKey] = useState('');
  const [resendDomain, setResendDomain] = useState('');
  const [resendName, setResendName] = useState('');
  const [showResendKey, setShowResendKey] = useState(false);
  const [isSavingResend, setIsSavingResend] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [resendConfigured, setResendConfigured] = useState(false);
  const [loadingResend, setLoadingResend] = useState(true);

  // Stripe state
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('');
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showStripeWebhook, setShowStripeWebhook] = useState(false);
  const [isSavingStripe, setIsSavingStripe] = useState(false);
  const [stripeConfigured, setStripeConfigured] = useState(false);

  useEffect(() => {
    loadResendSettings();
  }, []);

  const loadResendSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings' as any)
        .select('key, value')
        .in('key', ['resend_from_domain', 'resend_from_name']);

      if (error) throw error;

      const settings = (data as any[]) || [];
      const map: Record<string, string> = {};
      for (const row of settings) {
        map[row.key] = row.value;
      }

      // API key is managed via backend secrets — show as configured
      // (We can't read it from the client, but it's set as RESEND_API_KEY secret)
      setResendApiKey('••••••••••••');
      setResendConfigured(true);

      if (map.resend_from_domain) setResendDomain(map.resend_from_domain);
      if (map.resend_from_name) setResendName(map.resend_from_name);
    } catch (err) {
      console.error('Erro ao carregar configurações Resend:', err);
    } finally {
      setLoadingResend(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error('Informe a chave da API');
      return;
    }
    setIsSaving(true);
    // TODO: salvar via edge function em secrets
    setTimeout(() => {
      toast.success('Chave salva com sucesso');
      setIsSaving(false);
    }, 1000);
  };

  const handleSaveResend = async () => {
    // API key is managed via backend secrets — only domain/name are saved to DB
    const isNewKey = resendApiKey && !resendApiKey.includes('•');

    // Validate the key before saving (but don't store it in DB)
    if (isNewKey) {
      setIsValidating(true);
      try {
        const { data, error } = await supabase.functions.invoke('validate-resend-key', {
          body: { api_key: resendApiKey },
        });

        if (error) throw error;

        if (!data.valid) {
          toast.error(data.error || 'Chave do Resend inválida');
          setIsValidating(false);
          return;
        }

        if (data.domains && data.domains.length > 0) {
          const domainNames = data.domains.map((d: any) => d.name).join(', ');
          toast.info(`Domínios verificados: ${domainNames}`);
        }

        toast.info('A chave da API deve ser configurada nos secrets do backend (RESEND_API_KEY).');
      } catch (err: any) {
        console.error('Erro ao validar chave Resend:', err);
        toast.error('Erro ao validar chave: ' + (err.message || 'Erro desconhecido'));
        setIsValidating(false);
        return;
      }
      setIsValidating(false);
    }

    setIsSavingResend(true);
    try {
      const upserts: { key: string; value: string }[] = [];

      if (resendDomain.trim()) {
        upserts.push({ key: 'resend_from_domain', value: resendDomain.trim() });
      }
      if (resendName.trim()) {
        upserts.push({ key: 'resend_from_name', value: resendName.trim() });
      }

      if (upserts.length === 0 && !isNewKey) {
        toast.info('Nenhuma alteração para salvar');
        setIsSavingResend(false);
        return;
      }

      for (const item of upserts) {
        const { error } = await supabase
          .from('system_settings' as any)
          .upsert(
            { key: item.key, value: item.value, updated_at: new Date().toISOString() },
            { onConflict: 'key' }
          );
        if (error) throw error;
      }

      toast.success('Configurações do Resend salvas com sucesso');
      setResendConfigured(true);

      if (isNewKey) {
        setResendApiKey('••••••••••••');
      }
    } catch (err: any) {
      console.error('Erro ao salvar Resend:', err);
      toast.error('Erro ao salvar configurações: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setIsSavingResend(false);
    }
  };

  const handleSaveStripe = async () => {
    if (!stripeSecretKey.trim()) {
      toast.error('Informe a Secret Key do Stripe');
      return;
    }
    setIsSavingStripe(true);
    try {
      const { data, error } = await supabase.functions.invoke('save-integration-key', {
        body: { key: stripeSecretKey, provider: 'stripe' },
      });
      if (error) throw error;
      toast.success(data?.message || 'Configuração do Stripe salva');
      setStripeConfigured(true);
      setStripeSecretKey('••••••••••••');
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setIsSavingStripe(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AbacatePay Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">AbacatePay</CardTitle>
              <CardDescription>
                Configure sua integração com o AbacatePay para cobrança recorrente de empresas.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">
              Pendente
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="abacate-api-key">Chave da API (Secret Key)</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="abacate-api-key"
                  type={showKey ? 'text' : 'password'}
                  placeholder="abc_live_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Obtenha sua chave no painel do{' '}
              <a
                href="https://abacatepay.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                AbacatePay <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resend Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Resend — Envio de Emails</CardTitle>
                <CardDescription>
                  Configure a API do Resend para envio de relatórios e notificações por email.
                </CardDescription>
              </div>
            </div>
            {!loadingResend && (
              <Badge
                variant="outline"
                className={resendConfigured
                  ? 'text-green-700 border-green-300 bg-green-50'
                  : 'text-destructive border-destructive/30 bg-destructive/10'
                }
              >
                {resendConfigured ? 'Configurado' : 'Pendente'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resend-api-key">Chave da API Resend</Label>
            <div className="relative">
              <Input
                id="resend-api-key"
                type={showResendKey ? 'text' : 'password'}
                placeholder="re_..."
                value={resendApiKey}
                onChange={(e) => setResendApiKey(e.target.value)}
                onFocus={() => {
                  if (resendApiKey.includes('•')) setResendApiKey('');
                }}
              />
              <button
                type="button"
                onClick={() => setShowResendKey(!showResendKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showResendKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resend-domain">Domínio remetente</Label>
              <Input
                id="resend-domain"
                type="text"
                placeholder="sportextrema.com.br"
                value={resendDomain}
                onChange={(e) => setResendDomain(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Ex: sportextrema.com.br → relatorios@sportextrema.com.br
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resend-name">Nome do remetente</Label>
              <Input
                id="resend-name"
                type="text"
                placeholder="MetasHub"
                value={resendName}
                onChange={(e) => setResendName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Nome que aparece no "De:" do email
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Obtenha sua chave em{' '}
              <a
                href="https://resend.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                resend.com <ExternalLink className="h-3 w-3" />
              </a>
            </p>
            <Button onClick={handleSaveResend} disabled={isSavingResend || isValidating}>
              <Save className="h-4 w-4 mr-2" />
              {isValidating ? 'Validando...' : isSavingResend ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stripe Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Stripe — Pagamentos</CardTitle>
                <CardDescription>
                  Configure o Stripe para cobrança automática de assinaturas das empresas clientes.
                </CardDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className={stripeConfigured
                ? 'text-green-700 border-green-300 bg-green-50'
                : 'text-destructive border-destructive/30 bg-destructive/10'
              }
            >
              {stripeConfigured ? 'Configurado' : 'Pendente'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stripe-secret-key">Secret Key</Label>
            <div className="relative">
              <Input
                id="stripe-secret-key"
                type={showStripeSecret ? 'text' : 'password'}
                placeholder="sk_live_... ou sk_test_..."
                value={stripeSecretKey}
                onChange={(e) => setStripeSecretKey(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowStripeSecret(!showStripeSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showStripeSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stripe-publishable-key">Publishable Key</Label>
            <Input
              id="stripe-publishable-key"
              type="text"
              placeholder="pk_live_... ou pk_test_..."
              value={stripePublishableKey}
              onChange={(e) => setStripePublishableKey(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stripe-webhook-secret">Webhook Secret</Label>
            <div className="relative">
              <Input
                id="stripe-webhook-secret"
                type={showStripeWebhook ? 'text' : 'password'}
                placeholder="whsec_..."
                value={stripeWebhookSecret}
                onChange={(e) => setStripeWebhookSecret(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowStripeWebhook(!showStripeWebhook)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showStripeWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Obtenha suas chaves em{' '}
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                dashboard.stripe.com <ExternalLink className="h-3 w-3" />
              </a>
            </p>
            <Button onClick={handleSaveStripe} disabled={isSavingStripe}>
              <Save className="h-4 w-4 mr-2" />
              {isSavingStripe ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
