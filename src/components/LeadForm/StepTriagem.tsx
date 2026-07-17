import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SEGMENTO_GRUPOS, type SegmentoCategoria, type SegmentoItem } from "../../lib/segmentos";

const schema = z.object({
  negocio:            z.string().min(3, "Conta um pouco sobre o que você faz"),
  segmento:           z.string().min(1, "Selecione um segmento"),
  desafio:            z.string().min(1, "Selecione uma opção"),
  marketing_anterior: z.string().min(1, "Selecione uma opção"),
  orcamento:          z.string().min(1, "Selecione uma opção"),
  quando_comecar:     z.string().min(1, "Selecione uma opção"),
});

type TriagemData = z.infer<typeof schema>;

const inputCls = "w-full bg-white/5 border border-white/10 text-white placeholder-white/25 px-4 py-3 rounded-sm focus:outline-none focus:border-[hsl(42_100%_55%)] text-base sm:text-sm";
const errorCls = "text-[hsl(42_100%_55%)] text-xs mt-2";

// Opção clicável grande, ideal mobile (sem scroll horizontal, fácil de tocar)
function Option({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-4 border text-left transition-all duration-150 active:scale-[0.99] overflow-visible ${
        selected
          ? "border-[hsl(42_100%_55%)] bg-[hsl(42_100%_55%/0.12)] text-white"
          : "border-white/10 text-white hover:border-white/30"
      }`}
    >
      <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-[2px] transition-all ${
        selected ? "border-[hsl(42_100%_55%)] bg-[hsl(42_100%_55%)]" : "border-white/40"
      }`} />
      <span className="flex-1 min-w-0 text-[15px] sm:text-sm leading-snug break-words">{label}</span>
    </button>
  );
}

// Carrossel horizontal com scroll-snap nativo (touch-friendly, sem lib externa)
function SwipeRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 sm:-mx-1 sm:px-1"
      style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
    >
      {children}
    </div>
  );
}

function SwipeCard({ label, selected, onClick, index }: { label: string; selected: boolean; onClick: () => void; index: number }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      className={`snap-center flex-shrink-0 w-[150px] flex flex-col items-start gap-3 px-4 py-4 border text-left transition-all duration-150 active:scale-[0.97] rounded-sm ${
        selected
          ? "border-[hsl(42_100%_55%)] bg-[hsl(42_100%_55%/0.12)] text-white"
          : "border-white/10 text-white hover:border-white/30"
      }`}
    >
      <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
        selected ? "border-[hsl(42_100%_55%)] bg-[hsl(42_100%_55%)]" : "border-white/40"
      }`} />
      <span className="text-[15px] sm:text-sm leading-snug break-words">{label}</span>
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
// 0: negocio (texto — botão continuar)
// 1: segmento (auto-advance)
// 2: desafio (auto-advance)
// 3: marketing_anterior (auto-advance)
// 4: orcamento (auto-advance)
// 5: quando_comecar (auto-advance + submit)
const SUB_STEPS = 6;
const subTitles = ["O que você faz", "Seu segmento", "Maior desafio", "Marketing", "Orçamento", "Quando começar"];

interface Props {
  defaultValues: Partial<TriagemData>;
  onNext: (data: TriagemData, qualificado: boolean) => void;
}

export function StepTriagem({ defaultValues, onNext }: Props) {
  const [sub, setSub] = useState(0);
  const [picker, setPicker] = useState<PickerState>(() => findSelection(defaultValues.segmento));

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<TriagemData>({
    resolver: zodResolver(schema),
    defaultValues: { negocio: "", segmento: "", desafio: "", marketing_anterior: "", orcamento: "", quando_comecar: "", ...defaultValues },
    mode: "onBlur",
  });

  const watched = watch();

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
        {subTitles[sub]} — {sub + 1} de {SUB_STEPS}
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

          {/* SUB 0 — O que faz */}
          {sub === 0 && (
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

          {/* SUB 1 — Segmento */}
          {sub === 1 && (
            <div>
              <h3 className="text-white text-xl sm:text-2xl font-display mb-2">Qual o segmento do seu negócio?</h3>
              <p className="text-white/60 text-sm mb-5">Arraste para o lado e toque para selecionar.</p>

              {picker.stage === "cat" && (
                <SwipeRow>
                  {SEGMENTO_GRUPOS.map((grupo, i) => (
                    <SwipeCard
                      key={grupo.cat}
                      index={i}
                      label={grupo.cat}
                      selected={picker.cat?.cat === grupo.cat}
                      onClick={() => setPicker({ stage: "item", cat: grupo, item: null })}
                    />
                  ))}
                </SwipeRow>
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
                  <SwipeRow>
                    {picker.cat.itens.map((item, i) => (
                      <SwipeCard
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
                  </SwipeRow>
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
                  <SwipeRow>
                    {picker.item.subitens!.map((subnicho, i) => (
                      <SwipeCard
                        key={subnicho}
                        index={i}
                        label={subnicho}
                        selected={watched.segmento === `${picker.item!.label} — ${subnicho}`}
                        onClick={() => pickAndAdvance("segmento", `${picker.item!.label} — ${subnicho}`)}
                      />
                    ))}
                  </SwipeRow>
                </div>
              )}

              {errors.segmento && <p className={errorCls}>{errors.segmento.message}</p>}
            </div>
          )}

          {/* SUB 2 — Desafio */}
          {sub === 2 && (
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

          {/* SUB 3 — Marketing anterior */}
          {sub === 3 && (
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

          {/* SUB 4 — Orçamento */}
          {sub === 4 && (
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

          {/* SUB 5 — Quando começar */}
          {sub === 5 && (
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
