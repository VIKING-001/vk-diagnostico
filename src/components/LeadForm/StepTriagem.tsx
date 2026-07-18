import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SEGMENTO_GRUPOS } from "../../lib/segmentos";
import { Option } from "./shared";

const schema = z.object({
  negocio:            z.string().min(3, "Conta um pouco sobre o que você faz"),
  segmento:           z.string().min(1, "Selecione um segmento"),
  desafio:            z.string().min(1, "Selecione uma opção"),
  marketing_anterior: z.string().min(1, "Selecione uma opção"),
  campanhas_pagas:    z.string(),
  orcamento:          z.string().min(1, "Selecione uma opção"),
  quando_comecar:     z.string().min(1, "Selecione uma opção"),
});

type TriagemData = z.infer<typeof schema>;

const inputCls = "w-full bg-white/5 border border-white/10 text-white placeholder-white/25 px-4 py-3 rounded-sm focus:outline-none focus:border-[hsl(42_100%_55%)] text-base sm:text-sm";
const errorCls = "text-[hsl(42_100%_55%)] text-xs mt-2";

// Separa emoji do texto em labels tipo "🏥 Saúde e Bem-estar"
function splitIcon(label: string): { icon: string | null; text: string } {
  const match = label.match(/^(\p{Extended_Pictographic}️?)\s+(.+)$/u);
  return match ? { icon: match[1], text: match[2] } : { icon: null, text: label };
}

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

interface FlatSegmento { category: string; value: string; }

const FLAT_SEGMENTOS: FlatSegmento[] = SEGMENTO_GRUPOS.flatMap(cat =>
  cat.itens.flatMap(item =>
    item.subitens
      ? item.subitens.map(sub => ({ category: cat.cat, value: `${item.label} — ${sub}` }))
      : [{ category: cat.cat, value: item.label }]
  )
);

// Modal com busca — mostra todos os nichos de uma vez, agrupados por categoria
function SegmentoModal({ value, onSelect, onClose }: { value: string; onSelect: (v: string) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? FLAT_SEGMENTOS.filter(s => normalize(s.value).includes(normalize(query)) || normalize(s.category).includes(normalize(query)))
    : FLAT_SEGMENTOS;

  const grouped = filtered.reduce<Record<string, FlatSegmento[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[85vh] bg-[hsl(222_47%_5%)] border border-white/10 rounded-t-xl sm:rounded-xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/8">
          <h3 className="text-white font-display text-lg">Selecione o segmento</h3>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors p-1" aria-label="Fechar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="px-5 py-3 border-b border-white/8">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar nicho... (ex: clínica, moda, e-commerce)"
            autoFocus
            className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 px-4 py-2.5 rounded-sm focus:outline-none focus:border-[hsl(42_100%_55%)] text-sm"
          />
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-3">
          {Object.keys(grouped).length === 0 && (
            <p className="text-white/40 text-sm py-6 text-center">Nenhum nicho encontrado.</p>
          )}
          {Object.entries(grouped).map(([category, items]) => {
            const { icon, text } = splitIcon(category);
            return (
              <div key={category} className="mb-4 last:mb-2">
                <p className="text-[0.65rem] tracking-widest uppercase text-[hsl(42_100%_55%)] mb-2 flex items-center gap-1.5">
                  {icon && <span>{icon}</span>}{text}
                </p>
                <div className="flex flex-col gap-1">
                  {items.map(item => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => onSelect(item.value)}
                      className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-sm text-left text-sm transition-colors ${
                        value === item.value
                          ? "bg-[hsl(42_100%_55%/0.14)] text-white border border-[hsl(42_100%_55%/0.4)]"
                          : "text-white/75 hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <span className="break-words">{item.value}</span>
                      {value === item.value && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(42 100% 55%)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── SUB-STEPS — 1 pergunta por tela ─────────────────────────────────────
// negocio (texto — botão continuar), segmento, desafio, marketing_anterior,
// campanhas_pagas (só se marketing_anterior === "Sim, já investi"), orcamento, quando_comecar
type StepKey = "negocio" | "segmento" | "desafio" | "marketing_anterior" | "campanhas_pagas" | "orcamento" | "quando_comecar";

const STEP_TITLES: Record<StepKey, string> = {
  negocio: "O que você faz",
  segmento: "Seu segmento",
  desafio: "Maior desafio",
  marketing_anterior: "Marketing",
  campanhas_pagas: "Investimento atual",
  orcamento: "Orçamento",
  quando_comecar: "Quando começar",
};

function getActiveSteps(marketingAnterior?: string): StepKey[] {
  const steps: StepKey[] = ["negocio", "segmento", "desafio", "marketing_anterior"];
  if (marketingAnterior === "Sim, já investi") steps.push("campanhas_pagas");
  steps.push("orcamento", "quando_comecar");
  return steps;
}

interface Props {
  defaultValues: Partial<TriagemData>;
  onNext: (data: TriagemData, qualificado: boolean) => void;
}

export function StepTriagem({ defaultValues, onNext }: Props) {
  const [sub, setSub] = useState(0);
  const [segmentoModalOpen, setSegmentoModalOpen] = useState(false);

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<TriagemData>({
    resolver: zodResolver(schema),
    defaultValues: { negocio: "", segmento: "", desafio: "", marketing_anterior: "", campanhas_pagas: "", orcamento: "", quando_comecar: "", ...defaultValues },
    mode: "onBlur",
  });

  const watched = watch();
  const activeSteps = getActiveSteps(watched.marketing_anterior);
  const SUB_STEPS = activeSteps.length;
  const currentStep = activeSteps[sub];

  function goNext() {
    if (sub < SUB_STEPS - 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setSub(s => s + 1);
    } else {
      handleSubmit((data) => {
        const qualificado = !(data.quando_comecar === "Ainda pesquisando — sem prazo" && data.orcamento === "Até R$1.500");
        onNext(data, qualificado);
      })();
    }
  }

  function pickAndAdvance(field: keyof TriagemData, value: string) {
    setValue(field, value, { shouldValidate: true });
    // pequeno delay pro usuário ver a seleção
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (sub < SUB_STEPS - 1) setSub(s => s + 1);
      else handleSubmit((data) => {
        const qualificado = !(data.quando_comecar === "Ainda pesquisando — sem prazo" && data.orcamento === "Até R$1.500");
        onNext(data, qualificado);
      })();
    }, 280);
  }

  async function handleTextNext() {
    const valid = await trigger("negocio");
    if (!valid) return;
    goNext();
  }

  return (
    <div>
      <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[hsl(42_100%_55%)] mb-2">
        {STEP_TITLES[currentStep]} — {sub + 1} de {SUB_STEPS}
      </p>

      {/* barra de progresso fina */}
      <div className="flex gap-1 mb-8">
        {Array.from({ length: SUB_STEPS }).map((_, i) => (
          <div key={i} className={`flex-1 h-0.5 transition-all duration-300 ${
            i < sub ? "bg-[hsl(42_100%_55%)]" : i === sub ? "bg-[hsl(42_100%_55%/0.5)]" : "bg-white/10"
          }`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={sub}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2 }}
        >

          {/* O que faz */}
          {currentStep === "negocio" && (
            <div>
              <h3 className="text-white text-xl sm:text-2xl font-display mb-2">O que você faz e o que vende?</h3>
              <p className="text-white/60 text-sm mb-5">Pode ser qualquer negócio — produto, serviço, presencial ou online.</p>
              <input
                {...register("negocio")}
                placeholder="Ex: hamburgueria, consultoria, loja de roupas..."
                className={inputCls}
                autoFocus
              />
              {errors.negocio && <p className={errorCls}>{errors.negocio.message}</p>}

              <button
                type="button"
                onClick={handleTextNext}
                className="w-full bg-[hsl(42_100%_55%)] text-[hsl(222_47%_5%)] font-bold text-sm tracking-widest uppercase py-4 rounded-sm hover:opacity-90 transition-opacity mt-6"
              >
                Continuar →
              </button>
            </div>
          )}

          {/* Segmento */}
          {currentStep === "segmento" && (
            <div>
              <h3 className="text-white text-xl sm:text-2xl font-display mb-2">Qual o segmento do seu negócio?</h3>
              <p className="text-white/60 text-sm mb-5">Toque pra abrir a lista completa de nichos.</p>

              <button
                type="button"
                onClick={() => setSegmentoModalOpen(true)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-4 border text-left rounded-sm transition-colors ${
                  watched.segmento ? "border-[hsl(42_100%_55%)] bg-[hsl(42_100%_55%/0.08)] text-white" : "border-white/15 text-white/40 hover:border-white/30"
                }`}
              >
                <span className="text-sm">{watched.segmento || "Selecionar segmento..."}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 opacity-60"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>

              {errors.segmento && <p className={errorCls}>{errors.segmento.message}</p>}
            </div>
          )}

          {/* Desafio */}
          {currentStep === "desafio" && (
            <div>
              <h3 className="text-white text-xl sm:text-2xl font-display mb-2">Qual seu maior desafio agora?</h3>
              <p className="text-white/60 text-sm mb-5">Toque na opção que mais combina com o seu momento.</p>
              <div className="flex flex-col gap-2">
                {["Atrair mais clientes", "Converter melhor os que chegam", "Estruturar e fortalecer a marca", "Crescer com consistência"].map(o => (
                  <Option key={o} label={o} selected={watched.desafio === o} onClick={() => pickAndAdvance("desafio", o)} />
                ))}
              </div>
              {errors.desafio && <p className={errorCls}>{errors.desafio.message}</p>}
            </div>
          )}

          {/* Marketing anterior */}
          {currentStep === "marketing_anterior" && (
            <div>
              <h3 className="text-white text-xl sm:text-2xl font-display mb-2">Você já investiu em marketing digital?</h3>
              <p className="text-white/60 text-sm mb-5">Não tem certo ou errado — só ajuda a entender seu histórico.</p>
              <div className="flex flex-col gap-2">
                {["Sim, já investi", "Não, nunca investi"].map(o => (
                  <Option key={o} label={o} selected={watched.marketing_anterior === o} onClick={() => pickAndAdvance("marketing_anterior", o)} />
                ))}
              </div>
              {errors.marketing_anterior && <p className={errorCls}>{errors.marketing_anterior.message}</p>}
            </div>
          )}

          {/* Quanto já investe (só aparece se marketing_anterior === "Sim, já investi") */}
          {currentStep === "campanhas_pagas" && (
            <div>
              <h3 className="text-white text-xl sm:text-2xl font-display mb-2">Quanto você investe em campanhas pagas hoje, por mês?</h3>
              <p className="text-white/60 text-sm mb-5">O que você já gasta atualmente com tráfego pago.</p>
              <div className="flex flex-col gap-2">
                {["Até R$500", "R$500 – R$1.500", "R$1.500 – R$3.000", "Acima de R$3.000"].map(o => (
                  <Option key={o} label={o} selected={watched.campanhas_pagas === o} onClick={() => pickAndAdvance("campanhas_pagas", o)} />
                ))}
              </div>
            </div>
          )}

          {/* Orçamento */}
          {currentStep === "orcamento" && (
            <div>
              <h3 className="text-white text-xl sm:text-2xl font-display mb-2">Qual seu orçamento mensal para marketing?</h3>
              <p className="text-white/60 text-sm mb-5">Quanto você consegue investir todo mês.</p>
              <div className="flex flex-col gap-2">
                {["Até R$1.500", "R$1.500 – R$3.000", "R$3.000 – R$6.000", "Acima de R$6.000"].map(o => (
                  <Option key={o} label={o} selected={watched.orcamento === o} onClick={() => pickAndAdvance("orcamento", o)} />
                ))}
              </div>
              {errors.orcamento && <p className={errorCls}>{errors.orcamento.message}</p>}
            </div>
          )}

          {/* Quando começar */}
          {currentStep === "quando_comecar" && (
            <div>
              <h3 className="text-white text-xl sm:text-2xl font-display mb-2">Quando você quer começar?</h3>
              <p className="text-white/60 text-sm mb-5">Seja honesto — isso não elimina ninguém, só ajuda a priorizar.</p>
              <div className="flex flex-col gap-2">
                {["Agora — já decidi", "Em breve — estou avaliando", "Ainda pesquisando — sem prazo"].map(o => (
                  <Option key={o} label={o} selected={watched.quando_comecar === o} onClick={() => pickAndAdvance("quando_comecar", o)} />
                ))}
              </div>
              {errors.quando_comecar && <p className={errorCls}>{errors.quando_comecar.message}</p>}
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Botão Voltar discreto no rodapé (só aparece após o primeiro sub-step) */}
      {sub > 0 && (
        <button
          type="button"
          onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setSub(s => s - 1); }}
          className="text-white/60 text-xs tracking-widest uppercase mt-8 hover:text-white/70 transition-colors"
        >
          ← Voltar
        </button>
      )}

      <AnimatePresence>
        {segmentoModalOpen && (
          <SegmentoModal
            value={watched.segmento}
            onClose={() => setSegmentoModalOpen(false)}
            onSelect={(v) => {
              setSegmentoModalOpen(false);
              pickAndAdvance("segmento", v);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
