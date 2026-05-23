import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD ?? "vk@admin2024";
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
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <p className="font-bold text-sm text-white">{lead.nome}</p>
            <p className="text-xs text-white/40">{lead.empresa}</p>
          </div>
          {lead.qualificado
            ? <span className="text-[0.55rem] tracking-widest uppercase bg-[hsl(42_100%_55%/0.15)] text-[hsl(42_100%_55%)] px-2 py-1 rounded-sm">Qualificado</span>
            : <span className="text-[0.55rem] tracking-widest uppercase bg-white/5 text-white/30 px-2 py-1 rounded-sm">Não qualificado</span>
          }
          {lead.tipo_negocio && (
            <span className="text-[0.55rem] tracking-widest uppercase bg-white/5 text-white/40 px-2 py-1 rounded-sm hidden sm:inline">
              {TIPO_LABELS[lead.tipo_negocio] ?? lead.tipo_negocio}
            </span>
          )}
        </div>
        <div className="flex items-center gap-6">
          <p className="text-xs text-white/30 hidden sm:block">{formatDate(lead.created_at)}</p>
          <span className="text-white/30 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
          {/* Contato */}
          <div className="space-y-3">
            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
              <span className="text-white/35">Nome completo</span>
              <span className="text-white/80 font-medium">{lead.nome}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
              <span className="text-white/35">WhatsApp</span>
              <span className="text-white/80 font-medium">{lead.whatsapp}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
              <span className="text-white/35">E-mail</span>
              <span className="text-white/80">{lead.email}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
              <span className="text-white/35">Empresa</span>
              <span className="text-white/80">{lead.empresa}</span>
            </div>
            {lead.cargo && (
              <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                <span className="text-white/35">Cargo</span>
                <span className="text-white/80">{lead.cargo}</span>
              </div>
            )}
            {lead.instagram && (
              <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
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

          {/* Triagem */}
          <div>
            <p className="text-[0.55rem] tracking-widest uppercase text-white/25 mb-2">Triagem</p>
            <div className="space-y-2">
              {triagemFields.map(k => (lead as any)[k] ? (
                <div key={k} className="grid grid-cols-[160px_1fr] gap-2 text-sm">
                  <span className="text-white/35">{FIELD_LABELS[k]}</span>
                  <span className="text-white/80">{(lead as any)[k]}</span>
                </div>
              ) : null)}
            </div>
          </div>

          {/* Diagnóstico */}
          {lead.qualificado && (
            <div>
              <p className="text-[0.55rem] tracking-widest uppercase text-white/25 mb-2">Diagnóstico estratégico</p>
              <div className="space-y-2">
                {diagFields.map(k => (lead as any)[k] ? (
                  <div key={k} className="grid grid-cols-[160px_1fr] gap-2 text-sm">
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

export function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "qualified" | "unqualified">("all");

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    supabase.from("leads").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setLeads((data as Lead[]) ?? []); setLoading(false); });
  }, [authed]);

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (pass === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
    setLeads([]);
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[hsl(222_47%_2%)] text-white flex items-center justify-center px-6">
        <form onSubmit={login} className="w-full max-w-sm space-y-4">
          <p className="font-display text-3xl text-[hsl(42_100%_55%)]">VK COMPANY</p>
          <p className="text-xs text-white/30 tracking-widest uppercase">Painel administrativo</p>
          <input
            type="password"
            placeholder="Senha"
            value={pass}
            onChange={e => setPass(e.target.value)}
            className={`w-full bg-white/5 border ${error ? "border-red-500/60" : "border-white/10"} text-white placeholder-white/25 px-4 py-3 rounded-sm focus:outline-none focus:border-[hsl(42_100%_55%)] text-sm`}
            autoFocus
          />
          {error && <p className="text-red-400 text-xs">Senha incorreta.</p>}
          <button type="submit" className="w-full bg-[hsl(42_100%_55%)] text-[hsl(222_47%_5%)] font-bold text-sm tracking-widest uppercase py-3 rounded-sm hover:opacity-90">
            Entrar
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
    <div className="min-h-screen bg-[hsl(222_47%_2%)] text-white">
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <span className="font-display text-xl text-[hsl(42_100%_55%)] tracking-wider">VK COMPANY — Admin</span>
        <button onClick={logout} className="text-[0.68rem] tracking-[0.18em] uppercase text-white/30 hover:text-white/60 transition-colors">
          Sair
        </button>
      </header>

      <main className="px-6 py-10 max-w-5xl mx-auto space-y-8">
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
