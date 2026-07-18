import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SEGMENTO_GRUPOS, type SegmentoCategoria, type SegmentoItem } from "../../lib/segmentos";
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

// Grid de cards de seleção — ícone em badge, glow dourado no selecionado, check no canto
function ChoiceGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">{children}</div>;
}

// Separa emoji do texto em labels tipo "🏥 Saúde e Bem-estar"
function splitIcon(label: string): { icon: string | null; text: string } {
  const match = label.match(/^(\p{Extended_Pictographic}️?)\s+(.+)$/u);
  return match ? { icon: match[1], text: match[2] } : { icon: null, text: label };
}

function ChoiceCard({ label, selected, onClick, index }: { label: string; selected: boolean; onClick: () => void; index: number }) {
  const { icon, text } = splitIcon(label);
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.025, 0.25) }}
      className={`relative flex flex-col items-start gap-2.5 p-3.5 sm:p-4 rounded-lg border text-left transition-all duration-200 active:scale-[0.97] min-h-[92px] ${
        selected
          ? "border-[hsl(42_100%_55%)] bg-gradient-to-br from-[hsl(42_100%_55%/0.14)] to-[hsl(42_100%_55%/0.03)] shadow-[0_0_0_1px_hsl(42_100%_55%/0.35),0_8px_20px_-8px_hsl(42_100%_55%/0.4)]"
          : "border-white/8 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      {icon && (
        <span className={`grid place-items-center w-9 h-9 rounded-md text-base transition-colors ${
          selected ? "bg-[hsl(42_100%_55%/0.16)]" : "bg-white/5"
        }`}>
          {icon}
        </span>
      )}
      <span className={`text-[13px] sm:text-[13.5px] font-medium leading-snug break-words ${selected ? "text-white" : "text-white/75"}`}>
        {text}
      </span>
      {selected && (
        <span className="absolute top-2.5 right-2.5 grid place-items-center w-5 h-5 rounded-full bg-[hsl(42_100%_55%)]">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="hsl(222 47% 5%)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
      )}
    </motion.button>
  );
}

interface PickerState {
  stage: "cat" | "item" | "sub";
  cat: SegmentoCategoria | null;
  item: SegmentoItem | null;
}

// Se já existir um segmento selecionado (ex: voltando de uma etapa seguinte),
// reconstrói em qual estágio do picker o usuário estava.
function findSelection(segmento?: string): PickerState {
  if (segmento) {
    for (const cat of SEGMENTO_GRUPOS) {
      for (const item of cat.itens) {
        if (item.label === segmento) return { stage: "item", cat, item };
        if (item.subitens?.some(s => segmento === `${item.label} — ${s}`)) {
          return { stage: "sub", cat, item };
        }
      }
    }
  }
  return { stage: "cat", cat: null, item: null };
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
  const [picker, setPicker] = useState<PickerState>(() => findSelection(defaultValues.segmento));

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
              <p className="text-white/60 text-sm mb-5">Toque para selecionar.</p>

              {picker.stage === "cat" && (
                <ChoiceGrid>
                  {SEGMENTO_GRUPOS.map((grupo, i) => (
                    <ChoiceCard
                      key={grupo.cat}
                      index={i}
                      label={grupo.cat}
                      selected={picker.cat?.cat === grupo.cat}
                      onClick={() => setPicker({ stage: "item", cat: grupo, item: null })}
                    />
                  ))}
                </ChoiceGrid>
              )}

              {picker.stage === "item" && picker.cat && (
                <div>
                  <button
                    type="button"
                    onClick={() => setPicker({ stage: "cat", cat: null, item: null })}
                    className="text-[hsl(42_100%_55%)] text-xs tracking-widest uppercase mb-3"
                  >
                    ← Categorias
                  </button>
                  <p className="text-xs font-semibold tracking-wide text-[hsl(42_100%_55%)] mb-2">{picker.cat.cat}</p>
                  <ChoiceGrid>
                    {picker.cat.itens.map((item, i) => (
                      <ChoiceCard
                        key={item.label}
                        index={i}
                        label={item.label}
                        selected={watched.segmento === item.label}
                        onClick={() => {
                          if (item.subitens) setPicker({ stage: "sub", cat: picker.cat, item });
                          else pickAndAdvance("segmento", item.label);
                        }}
                      />
                    ))}
                  </ChoiceGrid>
                </div>
              )}

              {picker.stage === "sub" && picker.cat && picker.item && (
                <div>
                  <button
                    type="button"
                    onClick={() => setPicker({ stage: "item", cat: picker.cat, item: null })}
                    className="text-[hsl(42_100%_55%)] text-xs tracking-widest uppercase mb-3"
                  >
                    ← Voltar
                  </button>
                  <p className="text-xs font-semibold tracking-wide text-[hsl(42_100%_55%)] mb-2">{picker.item.label}</p>
                  <ChoiceGrid>
                    {picker.item.subitens!.map((subnicho, i) => (
                      <ChoiceCard
                        key={subnicho}
                        index={i}
                        label={subnicho}
                        selected={watched.segmento === `${picker.item!.label} — ${subnicho}`}
                        onClick={() => pickAndAdvance("segmento", `${picker.item!.label} — ${subnicho}`)}
                      />
                    ))}
                  </ChoiceGrid>
                </div>
              )}

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
    </div>
  );
}
