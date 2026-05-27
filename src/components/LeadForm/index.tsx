import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { StepTriagem } from "./StepTriagem";
import { StepContato } from "./StepContato";
import { StepDiagnostico } from "./StepDiagnostico";
import { StepSucesso } from "./StepSucesso";
import { StepDescartado } from "./StepDescartado";
import { saveLead, type LeadData } from "../../lib/supabase";
import { notifyLead } from "../../lib/notify";

type Step = "triagem" | "descartado" | "contato" | "diagnostico" | "sucesso";

const PROGRESS_STEPS: Step[] = ["triagem", "contato", "diagnostico", "sucesso"];
const STEP_LABELS: Partial<Record<Step, string>> = {
  triagem: "Triagem",
  contato: "Seus dados",
  diagnostico: "Diagnóstico",
  sucesso: "Concluído",
};

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
    try {
      await saveLead(full);
      await notifyLead(full);
    } catch (e) {
      console.error("Erro ao salvar lead:", e);
    } finally {
      setSending(false);
      goToStep("sucesso");
    }
  }

  return (
    <div className="w-full max-w-[600px] mx-auto">

      {/* Progress */}
      {step !== "descartado" && step !== "sucesso" && (
        <div className="mb-10">
          <div className="flex gap-1 mb-3">
            {PROGRESS_STEPS.map((s, i) => (
              <div key={s} className={`flex-1 h-0.5 transition-all duration-500 ${i < currentIdx ? "bg-[hsl(42_100%_55%)]" : i === currentIdx ? "bg-[hsl(42_100%_55%/0.5)]" : "bg-white/10"}`} />
            ))}
          </div>
          <div className="flex justify-between">
            {PROGRESS_STEPS.map((s, i) => (
              <span key={s} className={`text-[0.55rem] tracking-widest uppercase transition-colors duration-300 ${i <= currentIdx ? "text-[hsl(42_100%_55%)]" : "text-white/20"}`}>
                {STEP_LABELS[s]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Step headers */}
      {step === "triagem" && (
        <div className="mb-8">
          <p className="text-[0.6rem] tracking-widest uppercase text-[hsl(42_100%_55%)] mb-3">Diagnóstico gratuito</p>
          <h1 className="font-display text-5xl leading-tight mb-2">Antes de tudo,<br /><span className="text-white/60">me conta um pouco.</span></h1>
          <p className="text-sm text-white/60 leading-relaxed">5 perguntas. Com as respostas certas, já consigo mapear onde está o dinheiro parado no seu negócio.</p>
        </div>
      )}
      {step === "contato" && (
        <div className="mb-8">
          <p className="text-[0.6rem] tracking-widest uppercase text-[hsl(42_100%_55%)] mb-3">Seus dados</p>
          <h2 className="font-display text-5xl leading-tight mb-2">Ótimo. Agora preciso<br /><span className="text-white/60">saber com quem falo.</span></h2>
          <p className="text-sm text-white/60 leading-relaxed">Só para entrar em contato. Não compartilhamos com ninguém.</p>
        </div>
      )}
      {step === "diagnostico" && (
        <div className="mb-8">
          <p className="text-[0.6rem] tracking-widest uppercase text-[hsl(42_100%_55%)] mb-3">Diagnóstico estratégico</p>
          <h2 className="font-display text-5xl leading-tight mb-2">Agora vamos<br /><span className="text-white/60">ao que interessa.</span></h2>
          <p className="text-sm text-white/60 leading-relaxed">14 perguntas sobre o seu negócio. Quanto mais detalhe, melhor a análise.</p>
        </div>
      )}

      {/* Steps */}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
          {step === "triagem" && <StepTriagem defaultValues={formData} onNext={(data, qualificado) => { setFormData(f => ({ ...f, ...data, qualificado })); goToStep(qualificado ? "contato" : "descartado"); }} />}
          {step === "descartado" && <StepDescartado onBack={() => goToStep("triagem")} />}
          {step === "contato" && <StepContato defaultValues={formData} onNext={(data) => { setFormData(f => ({ ...f, ...data })); goToStep("diagnostico"); }} onBack={() => goToStep("triagem")} />}
          {step === "diagnostico" && <StepDiagnostico defaultValues={formData} tipo_negocio={formData.tipo_negocio} onNext={handleFinalSubmit} onBack={() => goToStep("contato")} />}
          {step === "sucesso" && <StepSucesso nome={formData.nome || ""} whatsapp={formData.whatsapp || ""} />}
        </motion.div>
      </AnimatePresence>

      {sending && (
        <div className="fixed inset-0 bg-[hsl(222_47%_2%/0.85)] backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[hsl(42_100%_55%)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-white/50 tracking-wide">Enviando diagnóstico...</p>
          </div>
        </div>
      )}
    </div>
  );
}
