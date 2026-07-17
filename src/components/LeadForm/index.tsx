import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { StepTriagem } from "./StepTriagem";
import { StepContato } from "./StepContato";
import { StepDiagnostico } from "./StepDiagnostico";
import { StepSucesso } from "./StepSucesso";
import { StepDescartado } from "./StepDescartado";
import { saveLead, type LeadData } from "../../lib/supabase";
import { notifyLead } from "../../lib/notify";
import { trackLeadConversion } from "../../lib/meta-pixel";

type Step = "triagem" | "descartado" | "contato" | "diagnostico" | "sucesso";

const PROGRESS_STEPS: Step[] = ["triagem", "contato", "diagnostico", "sucesso"];
const STEP_LABELS: Partial<Record<Step, string>> = {
  triagem:     "Triagem",
  contato:     "Seus dados",
  diagnostico: "Diagnóstico",
  sucesso:     "Concluído",
};

// ── Animações ────────────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

// ── Barra de progresso premium ────────────────────────────────────────────────
function ProgressBar({ currentIdx }: { currentIdx: number }) {
  return (
    <div className="mb-10">
      {/* Barras */}
      <div className="flex gap-1.5 mb-3">
        {PROGRESS_STEPS.map((_, i) => (
          <div key={i} className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/8">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "hsl(42 100% 55%)" }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: i < currentIdx ? 1 : i === currentIdx ? 0.5 : 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        ))}
      </div>
      {/* Labels */}
      <div className="flex justify-between">
        {PROGRESS_STEPS.map((s, i) => (
          <span
            key={s}
            className="text-[0.55rem] tracking-widest uppercase transition-colors duration-300"
            style={{ color: i <= currentIdx ? "hsl(42 100% 55%)" : "rgba(255,255,255,0.18)" }}
          >
            {STEP_LABELS[s]}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Hero de cada etapa ────────────────────────────────────────────────────────
function StepHero({ eyebrow, title, highlight, subtitle }: {
  eyebrow: string; title: string; highlight: string; subtitle: string;
}) {
  return (
    <div className="mb-8">
      <motion.p
        custom={0} variants={fadeUp} initial="hidden" animate="visible"
        className="text-[0.6rem] tracking-widest uppercase mb-3"
        style={{ color: "hsl(42 100% 55%)" }}
      >
        {eyebrow}
      </motion.p>

      <motion.h1
        custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="font-display text-4xl sm:text-5xl leading-tight mb-3"
      >
        {title}<br />
        <span style={{ color: "rgba(255,255,255,0.38)" }}>{highlight}</span>
      </motion.h1>

      <motion.p
        custom={2} variants={fadeUp} initial="hidden" animate="visible"
        className="text-sm text-white/60 leading-relaxed"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function LeadForm() {
  const [step, setStep] = useState<Step>("triagem");
  const [formData, setFormData] = useState<Partial<LeadData>>({});
  const [sending, setSending] = useState(false);

  const currentIdx = PROGRESS_STEPS.indexOf(step);

  function goToStep(next: Step) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep(next);
  }

  async function handleFinalSubmit(diagData: Pick<LeadData,
    "tempo_mercado" | "procedimentos_mes" | "ticket_medio" | "retorno_cliente" |
    "fonte_clientes" | "ciclo_vendas" | "taxa_fechamento" |
    "campanhas_pagas" | "melhor_resultado" | "prova_social" |
    "diferencial" | "case_marcante" | "capacidade_fechamento" | "objetivo_90_dias"
  >) {
    const full = { ...formData, ...diagData } as LeadData;
    setSending(true);
    // saveLead e notifyLead rodam independentes: se o banco falhar, o admin
    // ainda recebe o e-mail com os dados do lead (não depende da linha salva).
    const results = await Promise.allSettled([
      saveLead(full),
      notifyLead(full),
    ]);
    if (results[0].status === "rejected") {
      console.error("Erro ao salvar lead no banco:", results[0].reason);
    }
    if (results[1].status === "rejected") {
      console.error("Erro ao notificar lead:", results[1].reason);
    }
    trackLeadConversion(full.email, full.whatsapp);
    setSending(false);
    goToStep("sucesso");
  }

  return (
    <div className="w-full max-w-[600px] mx-auto">

      {/* Barra de progresso */}
      {step !== "descartado" && step !== "sucesso" && (
        <ProgressBar currentIdx={currentIdx} />
      )}

      {/* Hero de cada etapa */}
      <AnimatePresence mode="wait">
        {step === "triagem" && (
          <motion.div key="hero-triagem" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <StepHero
              eyebrow="Diagnóstico gratuito"
              title="Antes de tudo,"
              highlight="me conta um pouco."
              subtitle="5 perguntas. Com as respostas certas, já consigo mapear onde está o dinheiro parado no seu negócio."
            />
          </motion.div>
        )}
        {step === "contato" && (
          <motion.div key="hero-contato" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <StepHero
              eyebrow="Seus dados"
              title="Ótimo. Agora preciso"
              highlight="saber com quem falo."
              subtitle="Só para entrar em contato. Não compartilhamos com ninguém."
            />
          </motion.div>
        )}
        {step === "diagnostico" && (
          <motion.div key="hero-diag" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <StepHero
              eyebrow="Diagnóstico estratégico"
              title="Agora vamos"
              highlight="ao que interessa."
              subtitle="14 perguntas sobre o seu negócio. Quanto mais detalhe, melhor a análise."
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Container do step com borda sutil */}
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={step !== "sucesso" && step !== "descartado" ? "border border-white/5 rounded-sm bg-white/[0.02] p-6 sm:p-8 backdrop-blur-sm" : ""}
      >
        {step === "triagem" && (
          <StepTriagem
            defaultValues={formData}
            onNext={(data, qualificado) => {
              setFormData(f => ({ ...f, ...data, qualificado }));
              goToStep(qualificado ? "contato" : "descartado");
            }}
          />
        )}
        {step === "descartado" && <StepDescartado onBack={() => goToStep("triagem")} />}
        {step === "contato" && (
          <StepContato
            defaultValues={formData}
            onNext={(data) => { setFormData(f => ({ ...f, ...data })); goToStep("diagnostico"); }}
            onBack={() => goToStep("triagem")}
          />
        )}
        {step === "diagnostico" && (
          <StepDiagnostico
            defaultValues={formData}
            tipo_negocio={formData.tipo_negocio}
            onNext={handleFinalSubmit}
            onBack={() => goToStep("contato")}
          />
        )}
        {step === "sucesso" && <StepSucesso nome={formData.nome || ""} whatsapp={formData.whatsapp || ""} />}
      </motion.div>

      {/* Overlay de envio */}
      <AnimatePresence>
        {sending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[hsl(222_47%_2%/0.88)] backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="text-center space-y-4"
            >
              <div className="relative mx-auto w-10 h-10">
                <div className="absolute inset-0 rounded-full border-2 border-[hsl(42_100%_55%/0.2)]" />
                <div className="w-10 h-10 border-2 border-[hsl(42_100%_55%)] border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-sm text-white/50 tracking-wide">Enviando diagnóstico...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
