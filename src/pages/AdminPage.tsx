import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";
import { isPushSupported, subscribeToPush, getPushSubscription } from "../lib/push";

const SESSION_KEY = "vk_admin_auth";

const TIPO_LABELS: Record<string, string> = {
  restaurante: "🍔 Restaurante / Delivery",
  presencial:  "💆 Serviço presencial",
  consultivo:  "📊 Consultoria / Agência / B2B",
  ecommerce:   "🛒 E-commerce",
  autonomo:    "🎨 Profissional liberal",
};

interface Lead {
  id: string;
  created_at: string;
  nome: string;
  empresa: string;
  whatsapp: string;
  email: string;
  instagram?: string;
  cargo: string;
  qualificado: boolean;
  negocio: string;
  segmento: string;
  tipo_negocio: string;
  desafio: string;
  marketing_anterior: string;
  orcamento: string;
  quando_comecar: string;
  tempo_mercado: string;
  procedimentos_mes: string;
  ticket_medio: string;
  retorno_cliente: string;
  fonte_clientes: string;
  ciclo_vendas: string;
  taxa_fechamento: string;
  campanhas_pagas: string;
  melhor_resultado: string;
  prova_social: string;
  diferencial: string;
  case_marcante: string;
  capacidade_fechamento: string;
  objetivo_90_dias: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

const FIELD_LABELS: Record<string, string> = {
  negocio: "Negócio / o que vende",
  segmento: "Segmento",
  desafio: "Maior desafio",
  marketing_anterior: "Já investiu em marketing",
  orcamento: "Orçamento mensal",
  quando_comecar: "Quando quer começar",
  tempo_mercado: "Tempo no mercado",
  procedimentos_mes: "Faturamento mensal",
  ticket_medio: "Ticket médio",
  retorno_cliente: "Taxa de retorno de clientes",
  fonte_clientes: "Principal fonte de clientes",
  ciclo_vendas: "Ciclo de vendas",
  taxa_fechamento: "Taxa de fechamento",
  campanhas_pagas: "Campanhas pagas",
  melhor_resultado: "Melhor resultado com marketing",
  prova_social: "Prova social",
  diferencial: "Diferencial competitivo",
  case_marcante: "Case de resultado marcante",
  capacidade_fechamento: "Capacidade de fechamento",
  objetivo_90_dias: "Objetivo nos próximos 90 dias",
};

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="border border-white/8 bg-white/3 p-5">
      <p className="text-[0.6rem] tracking-widest uppercase text-white/30 mb-1">{label}</p>
      <p className="font-display text-4xl text-[hsl(42_100%_55%)]">{value}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false);
  const waLink = `https://wa.me/55${lead.whatsapp?.replace(/\D/g, "")}`;

  const diagFields = Object.keys(FIELD_LABELS).filter(k => !["negocio","segmento","desafio","marketing_anterior","orcamento","quando_comecar"].includes(k));
  const triagemFields = ["negocio", "segmento", "desafio", "marketing_anterior", "orcamento", "quando_comecar"];

  return (
    <div className={`border ${lead.qualificado ? "border-[hsl(42_100%_55%/0.3)]" : "border-white/8"} bg-white/2 transition-all`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-4 text-left hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
          <div className="min-w-0">
            <p className="font-bold text-sm text-white truncate max-w-[45vw] sm:max-w-none">{lead.nome}</p>
            <p className="text-xs text-white/40 truncate max-w-[45vw] sm:max-w-none">{lead.empresa}</p>
          </div>
          {lead.qualificado
            ? <span className="text-[0.55rem] tracking-widest uppercase bg-[hsl(42_100%_55%/0.15)] text-[hsl(42_100%_55%)] px-2 py-1 rounded-sm shrink-0">Qualificado</span>
            : <span className="text-[0.55rem] tracking-widest uppercase bg-white/5 text-white/30 px-2 py-1 rounded-sm shrink-0">Não qualificado</span>
          }
          {lead.tipo_negocio && (
            <span className="text-[0.55rem] tracking-widest uppercase bg-white/5 text-white/40 px-2 py-1 rounded-sm hidden sm:inline shrink-0">
              {TIPO_LABELS[lead.tipo_negocio] ?? lead.tipo_negocio}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-6 shrink-0">
          <p className="text-xs text-white/30 hidden sm:block">{formatDate(lead.created_at)}</p>
          <span className="text-white/30 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-0.5 sm:gap-2 text-sm break-words min-w-0">
              <span className="text-white/35">Nome completo</span>
              <span className="text-white/80 font-medium">{lead.nome}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-0.5 sm:gap-2 text-sm break-words min-w-0">
              <span className="text-white/35">WhatsApp</span>
              <span className="text-white/80 font-medium">{lead.whatsapp}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-0.5 sm:gap-2 text-sm break-words min-w-0">
              <span className="text-white/35">E-mail</span>
              <span className="text-white/80">{lead.email}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-0.5 sm:gap-2 text-sm break-words min-w-0">
              <span className="text-white/35">Empresa</span>
              <span className="text-white/80">{lead.empresa}</span>
            </div>
            {lead.cargo && (
              <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-0.5 sm:gap-2 text-sm break-words min-w-0">
                <span className="text-white/35">Cargo</span>
                <span className="text-white/80">{lead.cargo}</span>
              </div>
            )}
            {lead.instagram && (
              <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-0.5 sm:gap-2 text-sm break-words min-w-0">
                <span className="text-white/35">Instagram</span>
                <a href={`https://instagram.com/${lead.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer"
                  className="text-[hsl(42_100%_55%)] hover:underline">{lead.instagram}</a>
              </div>
            )}
            <div className="flex flex-wrap gap-3 pt-1">
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[hsl(42_100%_55%)] text-[hsl(222_47%_5%)] font-bold text-xs tracking-widest uppercase px-5 py-2.5 rounded-sm hover:opacity-90">
                ↗ Abrir WhatsApp
              </a>
              <a href={`mailto:${lead.email}`}
                className="inline-flex items-center gap-2 border border-white/15 text-white/60 text-xs tracking-widest uppercase px-5 py-2.5 rounded-sm hover:border-white/30">
                ✉ Enviar e-mail
              </a>
            </div>
          </div>

          <div>
            <p className="text-[0.55rem] tracking-widest uppercase text-white/25 mb-2">Triagem</p>
            <div className="space-y-2">
              {triagemFields.map(k => (lead as any)[k] ? (
                <div key={k} className="grid grid-cols-1 sm:grid-cols-[170px_1fr] gap-0.5 sm:gap-2 text-sm break-words min-w-0">
                  <span className="text-white/35">{FIELD_LABELS[k]}</span>
                  <span className="text-white/80">{(lead as any)[k]}</span>
                </div>
              ) : null)}
            </div>
          </div>

          {lead.qualificado && (
            <div>
              <p className="text-[0.55rem] tracking-widest uppercase text-white/25 mb-2">Diagnóstico estratégico</p>
              <div className="space-y-2">
                {diagFields.map(k => (lead as any)[k] ? (
                  <div key={k} className="grid grid-cols-1 sm:grid-cols-[170px_1fr] gap-0.5 sm:gap-2 text-sm break-words min-w-0">
                    <span className="text-white/35 shrink-0">{FIELD_LABELS[k]}</span>
                    <span className="text-white/80">{(lead as any)[k]}</span>
                  </div>
                ) : null)}
              </div>
            </div>
          )}

          <p className="text-[0.6rem] text-white/20">{formatDate(lead.created_at)}</p>
        </div>
      )}
    </div>
  );
}

// ── Painel de alterar senha ────────────────────────────────────────────────
function ChangePasswordPanel() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function handleChange(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (next.length < 6) { setMsg("A nova senha precisa ter pelo menos 6 caracteres."); setStatus("error"); return; }
    if (next !== confirm) { setMsg("As senhas não coincidem."); setStatus("error"); return; }

    setStatus("loading");
    // Verifica senha atual no Supabase
    const { data } = await supabase.from("config").select("value").eq("key", "admin_password").single();
    if (!data || data.value !== current) {
      setMsg("Senha atual incorreta."); setStatus("error"); return;
    }
    // Salva nova senha
    const { error } = await supabase.from("config").update({ value: next }).eq("key", "admin_password");
    if (error) { setMsg("Erro ao salvar. Tente novamente."); setStatus("error"); return; }

    setStatus("ok");
    setMsg("Senha alterada com sucesso!");
    setCurrent(""); setNext(""); setConfirm("");
    setTimeout(() => { setOpen(false); setStatus("idle"); setMsg(""); }, 2000);
  }

  const inp = "w-full bg-white/5 border border-white/10 text-white placeholder-white/25 px-4 py-3 rounded-sm focus:outline-none focus:border-[hsl(42_100%_55%)] text-sm";

  return (
    <div className="border border-white/8 bg-white/2 rounded-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/3 transition-colors"
      >
        <div>
          <p className="text-sm font-bold text-white">🔑 Alterar senha do painel</p>
          <p className="text-xs text-white/30 mt-0.5">Mude sua senha de acesso sem precisar de ajuda técnica.</p>
        </div>
        <span className="text-white/30 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <form onSubmit={handleChange} className="px-5 pb-5 border-t border-white/5 pt-4 space-y-3">
          <input
            type="password"
            placeholder="Senha atual"
            value={current}
            onChange={e => setCurrent(e.target.value)}
            className={inp}
            required
          />
          <input
            type="password"
            placeholder="Nova senha (mín. 6 caracteres)"
            value={next}
            onChange={e => setNext(e.target.value)}
            className={inp}
            required
          />
          <input
            type="password"
            placeholder="Confirmar nova senha"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className={inp}
            required
          />
          {msg && (
            <p className={`text-xs ${status === "ok" ? "text-green-400" : "text-red-400"}`}>{msg}</p>
          )}
          <button
            type="submit"
            disabled={status === "loading" || status === "ok"}
            className="w-full bg-[hsl(42_100%_55%)] text-[hsl(222_47%_5%)] font-bold text-xs tracking-widest uppercase py-3 rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {status === "loading" ? "Salvando..." : status === "ok" ? "✓ Senha alterada!" : "Salvar nova senha"}
          </button>
        </form>
      )}
    </div>
  );
}

// ── Tela de redefinição de senha ──────────────────────────────────────────
function ForgotPasswordScreen({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<"send" | "reset" | "done">("send");
  const [code, setCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [msg, setMsg] = useState("");

  const inp = "w-full bg-white/5 border border-white/10 text-white placeholder-white/25 px-4 py-3 rounded-sm focus:outline-none focus:border-[hsl(42_100%_55%)] text-sm";

  async function handleSend() {
    setStatus("loading"); setMsg("");
    const r = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send" }),
    });
    const json = await r.json();
    if (!r.ok) { setMsg(json.error ?? "Erro ao enviar."); setStatus("error"); return; }
    setStatus("idle");
    setStep("reset");
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (newPass.length < 6) { setMsg("A senha precisa ter pelo menos 6 caracteres."); setStatus("error"); return; }
    if (newPass !== confirmPass) { setMsg("As senhas não coincidem."); setStatus("error"); return; }
    setStatus("loading");
    const r = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset", code, newPassword: newPass }),
    });
    const json = await r.json();
    if (!r.ok) { setMsg(json.error ?? "Erro ao redefinir."); setStatus("error"); return; }
    setStatus("idle");
    setStep("done");
  }

  return (
    <div className="min-h-screen bg-[hsl(222_47%_2%)] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <p className="font-display text-3xl text-[hsl(42_100%_55%)]">VK COMPANY</p>
          <p className="text-xs text-white/30 tracking-widest uppercase mt-1">Redefinir senha</p>
        </div>

        {step === "send" && (
          <div className="space-y-4">
            <p className="text-sm text-white/50 leading-relaxed">
              Vamos enviar um código de 6 dígitos para o seu e-mail cadastrado.<br />
              Válido por 15 minutos.
            </p>
            {msg && <p className="text-red-400 text-xs">{msg}</p>}
            <button
              onClick={handleSend}
              disabled={status === "loading"}
              className="w-full bg-[hsl(42_100%_55%)] text-[hsl(222_47%_5%)] font-bold text-sm tracking-widest uppercase py-3 rounded-sm hover:opacity-90 disabled:opacity-50"
            >
              {status === "loading" ? "Enviando..." : "Enviar código por e-mail"}
            </button>
            <button onClick={onBack} className="w-full text-white/30 text-xs tracking-widest uppercase hover:text-white/60 transition-colors py-1">
              ← Voltar ao login
            </button>
          </div>
        )}

        {step === "reset" && (
          <form onSubmit={handleReset} className="space-y-4">
            <p className="text-sm text-white/50">Código enviado! Verifique seu e-mail e insira abaixo.</p>
            <input
              placeholder="Código de 6 dígitos"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={inp}
              inputMode="numeric"
              required
            />
            <input
              type="password"
              placeholder="Nova senha (mín. 6 caracteres)"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              className={inp}
              required
            />
            <input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              className={inp}
              required
            />
            {msg && <p className="text-red-400 text-xs">{msg}</p>}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-[hsl(42_100%_55%)] text-[hsl(222_47%_5%)] font-bold text-sm tracking-widest uppercase py-3 rounded-sm hover:opacity-90 disabled:opacity-50"
            >
              {status === "loading" ? "Redefinindo..." : "Redefinir senha"}
            </button>
            <button type="button" onClick={() => setStep("send")} className="w-full text-white/30 text-xs tracking-widest uppercase hover:text-white/60 transition-colors py-1">
              ← Reenviar código
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="space-y-4 text-center">
            <p className="text-4xl">✓</p>
            <p className="text-white font-bold">Senha redefinida com sucesso!</p>
            <p className="text-sm text-white/40">Agora você pode entrar com a nova senha.</p>
            <button
              onClick={onBack}
              className="w-full bg-[hsl(42_100%_55%)] text-[hsl(222_47%_5%)] font-bold text-sm tracking-widest uppercase py-3 rounded-sm hover:opacity-90"
            >
              Ir para o login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Botão de ativar notificações push ───────────────────────────────────────
function NotificationsButton() {
  const [status, setStatus] = useState<"checking" | "off" | "on" | "unsupported" | "loading">("checking");

  useEffect(() => {
    if (!isPushSupported()) { setStatus("unsupported"); return; }
    getPushSubscription().then(sub => setStatus(sub ? "on" : "off"));
  }, []);

  async function activate() {
    setStatus("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setStatus("off"); return; }
      await subscribeToPush();
      setStatus("on");
    } catch (e) {
      console.error("Erro ao ativar notificações:", e);
      setStatus("off");
    }
  }

  if (status === "unsupported") return null;

  return (
    <button
      onClick={status === "on" ? undefined : activate}
      disabled={status === "loading" || status === "on"}
      className={`text-[0.68rem] tracking-[0.18em] uppercase transition-colors ${
        status === "on" ? "text-[hsl(42_100%_55%)]" : "text-white/30 hover:text-white/60"
      }`}
    >
      {status === "on" ? "🔔 Notificações ativas" : status === "loading" ? "Ativando..." : "🔕 Ativar notificações"}
    </button>
  );
}

// ── Página principal ───────────────────────────────────────────────────────
export function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("Senha incorreta.");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "qualified" | "unqualified">("all");
  const [showSettings, setShowSettings] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    supabase.from("leads").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setLeads((data as Lead[]) ?? []); setLoading(false); });
  }, [authed]);

  // Lista atualiza sozinha em tempo real quando um lead novo é inserido
  useEffect(() => {
    if (!authed) return;
    const channel = supabase
      .channel("leads-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads" }, (payload) => {
        setLeads(prev => [payload.new as Lead, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [authed]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(false);

    const { data } = await supabase.from("config").select("value").eq("key", "admin_password").single();
    const savedPass = data?.value ?? "vk@admin2024";

    if (pass === savedPass) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
    } else {
      setErrorMsg("Senha incorreta.");
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
    setLeads([]);
    setShowSettings(false);
  }

  if (showForgot) {
    return <ForgotPasswordScreen onBack={() => setShowForgot(false)} />;
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[hsl(222_47%_2%)] text-white flex items-center justify-center px-6">
        <form onSubmit={login} className="w-full max-w-sm space-y-4">
          <p className="font-display text-3xl text-[hsl(42_100%_55%)]">VK COMPANY</p>
          <p className="text-xs text-white/30 tracking-widest uppercase">Painel administrativo</p>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Senha"
              value={pass}
              onChange={e => setPass(e.target.value)}
              className={`w-full bg-white/5 border ${error ? "border-red-500/60" : "border-white/10"} text-white placeholder-white/25 pl-4 pr-11 py-3 rounded-sm focus:outline-none focus:border-[hsl(42_100%_55%)] text-sm`}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {error && <p className="text-red-400 text-xs">{errorMsg}</p>}
          <button type="submit" className="w-full bg-[hsl(42_100%_55%)] text-[hsl(222_47%_5%)] font-bold text-sm tracking-widest uppercase py-3 rounded-sm hover:opacity-90">
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="w-full text-white/30 text-xs tracking-widest uppercase hover:text-white/60 transition-colors py-1"
          >
            Esqueci minha senha
          </button>
        </form>
      </div>
    );
  }

  const qualified = leads.filter(l => l.qualificado);
  const unqualified = leads.filter(l => !l.qualificado);
  const today = leads.filter(l => isToday(l.created_at));
  const rate = leads.length ? Math.round((qualified.length / leads.length) * 100) : 0;
  const filtered = filter === "qualified" ? qualified : filter === "unqualified" ? unqualified : leads;

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[hsl(222_47%_2%)] text-white">
      <header className="border-b border-white/5 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="font-display text-lg sm:text-xl text-[hsl(42_100%_55%)] tracking-wider whitespace-nowrap">
          VK COMPANY<span className="hidden sm:inline"> — Admin</span>
        </span>
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <NotificationsButton />
          <button
            onClick={() => setShowSettings(s => !s)}
            className="text-[0.68rem] tracking-[0.18em] uppercase text-white/30 hover:text-white/60 transition-colors whitespace-nowrap"
          >
            ⚙ Config
          </button>
          <button onClick={logout} className="text-[0.68rem] tracking-[0.18em] uppercase text-white/30 hover:text-white/60 transition-colors whitespace-nowrap">
            Sair
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-8 sm:py-10 max-w-5xl mx-auto space-y-6 sm:space-y-8">

        {/* Configurações */}
        {showSettings && (
          <div className="space-y-3">
            <p className="text-[0.6rem] tracking-widest uppercase text-white/25">Configurações</p>
            <ChangePasswordPanel />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total de leads" value={leads.length} />
          <StatCard label="Qualificados" value={qualified.length} />
          <StatCard label="Taxa de qualificação" value={`${rate}%`} />
          <StatCard label="Hoje" value={today.length} />
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "qualified", "unqualified"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-[0.65rem] tracking-widest uppercase px-4 py-2 rounded-sm border transition-colors ${filter === f ? "border-[hsl(42_100%_55%)] text-[hsl(42_100%_55%)]" : "border-white/10 text-white/30 hover:border-white/25"}`}>
              {f === "all" ? `Todos (${leads.length})` : f === "qualified" ? `Qualificados (${qualified.length})` : `Não qualificados (${unqualified.length})`}
            </button>
          ))}
          <button onClick={() => { setLoading(true); supabase.from("leads").select("*").order("created_at", { ascending: false }).then(({ data }) => { setLeads((data as Lead[]) ?? []); setLoading(false); }); }}
            className="text-[0.65rem] tracking-widest uppercase px-4 py-2 rounded-sm border border-white/10 text-white/30 hover:border-white/25 ml-auto">
            ↻ Atualizar
          </button>
        </div>

        {/* Leads */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[hsl(42_100%_55%)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-white/25 text-sm py-10 text-center">Nenhum lead encontrado.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(l => <LeadCard key={l.id} lead={l} />)}
          </div>
        )}
      </main>
    </div>
  );
}
