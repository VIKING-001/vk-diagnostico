import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { StepTriagem } from "./StepTriagem";
import { StepContato } from "./StepContato";
import { StepSucesso } from "./StepSucesso";
import { StepDescartado } from "./StepDescartado";
import { saveLead, type LeadData } from "../../lib/supabase";
import { notifyLead } from "../../lib/notify";
import { trackLeadConversion } from "../../lib/meta-pixel";

type Step = "triagem" | "descartado" | "contato" | "sucesso";

const PROGRESS_STEPS: Step[] = ["triagem", "contato", "sucesso"];
const STEP_LABELS: Partial<Record<Step, string>> = {
  triagem:     "Triagem",
  contato:     "Seus dados",
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
  const [submitError, setSubmitError] = useState("");

  const currentIdx = PROGRESS_STEPS.indexOf(step);

  function goToStep(next: Step) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep(next);
  }

  async function handleContactSubmit(contactData: Required<Pick<LeadData, "nome" | "whatsapp" | "email" | "empresa" | "instagram">>) {
    const full = { ...formData, ...contactData } as LeadData;
    setSubmitError("");
    setSending(true);
    try {
      // Mantém a notificação de contingência caso o banco recuse o registro.
      const results = await Promise.allSettled([saveLead(full), notifyLead(full)]);
      if (results[0].status === "rejected") {
        console.error("Erro ao salvar lead no banco:", results[0].reason);
        setSubmitError("Não conseguimos registrar seus dados agora. Tente novamente.");
        return;
      }
      if (results[1].status === "rejected") {
        console.error("Erro ao notificar lead:", results[1].reason);
      }
      trackLeadConversion(full.email ?? "", full.whatsapp);
      setFormData(f => ({ ...f, ...contactData }));
      goToStep("sucesso");
    } catch (error) {
      console.error("Erro inesperado ao enviar lead:", error);
      setSubmitError("Não conseguimos registrar seus dados agora. Tente novamente.");
    } finally {
      setSending(false);
    }
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
              subtitle="Quatro respostas rápidas para entendermos seu momento antes de uma análise estratégica."
            />
          </motion.div>
        )}
        {step === "contato" && (
          <motion.div key="hero-contato" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <StepHero
              eyebrow="Seus dados"
              title="Ótimo. Agora preciso"
              highlight="saber com quem falo."
              subtitle="Com esses dados, vamos analisar o cenário da sua empresa e entender se faz sentido avançarmos."
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
            onNext={handleContactSubmit}
            onBack={() => goToStep("triagem")}
            submitError={submitError}
          />
        )}
        {step === "sucesso" && <StepSucesso nome={formData.nome || ""} whatsapp={formData.whatsapp || ""} desafio={formData.desafio || ""} faturamento={formData.procedimentos_mes || ""} investimento={formData.orcamento || ""} prazo={formData.quando_comecar || ""} />}
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
