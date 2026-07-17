import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Option } from "./shared";

const schema = z.object({
  tempo_mercado:          z.string().min(1, "Selecione uma opção"),
  procedimentos_mes:      z.string().min(1, "Selecione uma opção"),
  ticket_medio:           z.string().min(1, "Selecione uma opção"),
  taxa_fechamento:        z.string().min(1, "Selecione uma opção"),
  fonte_clientes:         z.string().min(1, "Selecione ao menos uma opção"),
  prova_social:           z.string().min(1, "Selecione uma opção"),
  capacidade_fechamento:  z.string().min(1, "Selecione uma opção"),
  objetivo_90_dias:       z.string().min(1, "Selecione uma opção"),
  objetivo_90_dias_outro: z.string(),
});

type DiagData = z.infer<typeof schema>;
type FieldKey = Exclude<keyof DiagData, "objetivo_90_dias_outro">;

const inputCls  = "w-full bg-white/5 border border-white/10 text-white placeholder-white/25 px-4 py-3 rounded-sm focus:outline-none focus:border-[hsl(42_100%_55%)] text-base sm:text-sm";
const errorCls  = "text-[hsl(42_100%_55%)] text-xs mt-2";

const FONTE_OPTIONS = ["Indicação", "Instagram / Redes sociais", "Google", "WhatsApp direto", "Loja física / ponto físico", "Tráfego pago", "Outro"];

function parseFonteClientes(saved?: string): string[] {
  if (!saved) return [];
  return saved.split(", ").map(s => s.trim()).filter(p => FONTE_OPTIONS.includes(p));
}

interface QuestionConfig {
  title: string;
  subtitle?: string;
  options: string[];
}

const QUESTIONS: Record<Exclude<FieldKey, "fonte_clientes">, QuestionConfig> = {
  tempo_mercado: {
    title: "Há quanto tempo você está no mercado?",
    options: ["Menos de 1 ano", "1 a 3 anos", "3 a 5 anos", "Mais de 5 anos"],
  },
  procedimentos_mes: {
    title: "Qual é o seu faturamento médio mensal hoje?",
    subtitle: "Seja sincero — isso ajuda a indicar a solução certa pro seu momento.",
    options: ["Até R$5.000", "R$5.000 – R$20.000", "R$20.000 – R$50.000", "R$50.000 – R$100.000", "R$100.000 – R$500.000", "Acima de R$500.000"],
  },
  ticket_medio: {
    title: "Qual é o seu ticket médio por venda, atendimento ou contrato?",
    subtitle: "O valor que cada cliente paga de uma vez (ou por mês, se for recorrente).",
    options: ["Até R$100", "R$100 – R$500", "R$500 – R$2.000", "Acima de R$2.000"],
  },
  taxa_fechamento: {
    title: "De cada 10 pessoas que entram em contato ou chegam até você, quantas compram?",
    options: ["Poucas (1 a 2 em 10)", "Algumas (3 a 5 em 10)", "Boa parte (6 a 8 em 10)", "Quase todas"],
  },
  prova_social: {
    title: "Você tem prova social? (depoimentos, avaliações, cases, antes/depois, fotos de clientes)",
    options: ["Tenho bastante — uso ativamente", "Tenho alguns — mas não uso direito", "Tenho pouco — está espalhado", "Não tenho nada estruturado"],
  },
  capacidade_fechamento: {
    title: "Se a demanda dobrasse amanhã, você teria estrutura para atender sem perder qualidade?",
    options: ["Sim, sem problema", "Talvez, com ajustes", "Não, precisaria estruturar"],
  },
  objetivo_90_dias: {
    title: "Qual é o seu objetivo nos próximos 90 dias?",
    options: ["Aumentar faturamento", "Conseguir mais clientes", "Aumentar ticket médio", "Fortalecer a marca / reconhecimento", "Expandir (nova unidade/produto)", "Outro"],
  },
};

const ACTIVE_FIELDS: FieldKey[] = [
  "tempo_mercado", "procedimentos_mes", "ticket_medio", "taxa_fechamento",
  "fonte_clientes", "prova_social", "capacidade_fechamento", "objetivo_90_dias",
];

function SelectQuestion({ title, subtitle, options, value, onSelect }: {
  title: string; subtitle?: string; options: string[]; value: string; onSelect: (v: string) => void;
}) {
  return (
    <div>
      <h3 className="text-white text-xl sm:text-2xl font-display mb-2">{title}</h3>
      {subtitle && <p className="text-white/60 text-sm mb-5">{subtitle}</p>}
      <div className="flex flex-col gap-2">
        {options.map(o => (
          <Option key={o} label={o} selected={value === o} onClick={() => onSelect(o)} />
        ))}
      </div>
    </div>
  );
}

interface Props {
  defaultValues: Partial<DiagData>;
  onNext: (data: DiagData) => void;
  onBack: () => void;
}

export function StepDiagnostico({ defaultValues, onNext, onBack }: Props) {
  const [sub, setSub] = useState(0);
  const [fonteSel, setFonteSel] = useState<string[]>(() => parseFonteClientes(defaultValues.fonte_clientes));

  const activeFields = ACTIVE_FIELDS;
  const SUB_STEPS = activeFields.length;
  const currentField = activeFields[sub];

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<DiagData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tempo_mercado: "", procedimentos_mes: "", ticket_medio: "", taxa_fechamento: "",
      fonte_clientes: "", prova_social: "",
      capacidade_fechamento: "", objetivo_90_dias: "", objetivo_90_dias_outro: "",
      ...defaultValues,
    },
    mode: "onBlur",
  });

  const watched = watch();

  // Sempre que a pergunta de multi-seleção é (re)visitada, sincroniza os chips com o valor salvo.
  useEffect(() => {
    if (currentField === "fonte_clientes") {
      setFonteSel(parseFonteClientes(watched.fonte_clientes));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sub]);

  function goNext() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (sub < SUB_STEPS - 1) {
      setSub(s => s + 1);
    } else {
      handleSubmit(onNext)();
    }
  }

  function goBack() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (sub === 0) onBack();
    else setSub(s => s - 1);
  }

  function pickAndAdvance(field: FieldKey, value: string) {
    setValue(field, value, { shouldValidate: true });
    setTimeout(goNext, 280);
  }

  function toggleFonte(o: string) {
    setFonteSel(sel => sel.includes(o) ? sel.filter(x => x !== o) : [...sel, o]);
  }

  function confirmFonte() {
    setValue("fonte_clientes", fonteSel.join(", "), { shouldValidate: true });
    goNext();
  }

  const singleSelectField = currentField !== "fonte_clientes" && currentField !== "objetivo_90_dias" ? currentField : null;

  return (
    <div>
      <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[hsl(42_100%_55%)] mb-2">
        Diagnóstico — {sub + 1} de {SUB_STEPS}
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
          {singleSelectField && (
            <div>
              <SelectQuestion
                {...QUESTIONS[singleSelectField as Exclude<FieldKey, "fonte_clientes">]}
                value={watched[singleSelectField] as string}
                onSelect={v => pickAndAdvance(singleSelectField, v)}
              />
              {errors[singleSelectField] && <p className={errorCls}>{errors[singleSelectField]?.message}</p>}
            </div>
          )}

          {currentField === "fonte_clientes" && (
            <div>
              <h3 className="text-white text-xl sm:text-2xl font-display mb-2">De onde vêm seus clientes hoje?</h3>
              <p className="text-white/60 text-sm mb-5">Toque em quantas opções fizerem sentido — pode marcar mais de uma.</p>
              <div className="flex flex-col gap-2 mb-6">
                {FONTE_OPTIONS.map(o => (
                  <Option key={o} label={o} selected={fonteSel.includes(o)} onClick={() => toggleFonte(o)} />
                ))}
              </div>
              {errors.fonte_clientes && <p className={errorCls}>{errors.fonte_clientes.message}</p>}
              <button
                type="button"
                onClick={confirmFonte}
                disabled={fonteSel.length === 0}
                className="w-full bg-[hsl(42_100%_55%)] text-[hsl(222_47%_5%)] font-bold text-sm tracking-widest uppercase py-4 rounded-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                Continuar →
              </button>
            </div>
          )}

          {currentField === "objetivo_90_dias" && (
            <div>
              <SelectQuestion
                {...QUESTIONS.objetivo_90_dias}
                value={watched.objetivo_90_dias}
                onSelect={v => {
                  setValue("objetivo_90_dias", v, { shouldValidate: true });
                  if (v !== "Outro") setTimeout(goNext, 280);
                }}
              />
              {errors.objetivo_90_dias && <p className={errorCls}>{errors.objetivo_90_dias.message}</p>}
              <AnimatePresence>
                {watched.objetivo_90_dias === "Outro" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <input
                      {...register("objetivo_90_dias_outro")}
                      placeholder="Especifique seu objetivo..."
                      className={inputCls}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!watched.objetivo_90_dias_outro}
                      className="w-full bg-[hsl(42_100%_55%)] text-[hsl(222_47%_5%)] font-bold text-sm tracking-widest uppercase py-4 rounded-sm hover:opacity-90 disabled:opacity-40 transition-opacity mt-3"
                    >
                      {sub === SUB_STEPS - 1 ? "Enviar diagnóstico →" : "Continuar →"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        onClick={goBack}
        className="text-white/60 text-xs tracking-widest uppercase mt-8 hover:text-white/70 transition-colors"
      >
        ← Voltar
      </button>
    </div>
  );
}
