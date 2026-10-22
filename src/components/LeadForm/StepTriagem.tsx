import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Option } from "./shared";

const schema = z.object({
  desafio: z.string().min(1, "Selecione uma opção"),
  procedimentos_mes: z.string().min(1, "Selecione uma faixa"),
  orcamento: z.string().min(1, "Selecione uma faixa"),
  quando_comecar: z.string().min(1, "Selecione uma opção"),
});

type TriagemData = z.infer<typeof schema>;
type StepKey = keyof TriagemData;

const STEP_TITLES: Record<StepKey, string> = {
  desafio: "Maior desafio",
  procedimentos_mes: "Faturamento mensal",
  orcamento: "Verba para anúncios",
  quando_comecar: "Prazo",
};

const STEPS: StepKey[] = ["desafio", "procedimentos_mes", "orcamento", "quando_comecar"];

interface Props {
  defaultValues: Partial<TriagemData>;
  onNext: (data: TriagemData, qualificado: boolean) => void;
}

export function StepTriagem({ defaultValues, onNext }: Props) {
  const [sub, setSub] = useState(0);
  const { handleSubmit, watch, setValue, formState: { errors } } = useForm<TriagemData>({
    resolver: zodResolver(schema),
    defaultValues: { desafio: "", procedimentos_mes: "", orcamento: "", quando_comecar: "", ...defaultValues },
    mode: "onBlur",
  });

  const watched = watch();
  const currentStep = STEPS[sub];

  function finish() {
    handleSubmit(data => {
      const qualificado = !(data.quando_comecar === "Ainda pesquisando — sem prazo" && data.orcamento === "Até R$1.500");
      onNext(data, qualificado);
    })();
  }

  function advance() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (sub < STEPS.length - 1) setSub(s => s + 1);
    else finish();
  }

  function pickAndAdvance(field: StepKey, value: string) {
    setValue(field, value, { shouldValidate: true });
    setTimeout(advance, 280);
  }

  const questions: Record<StepKey, { title: string; subtitle: string; options: string[] }> = {
    desafio: {
      title: "O que mais trava o crescimento da empresa hoje?",
      subtitle: "Escolha o ponto que mais se aproxima do seu momento.",
      options: [
        "Invisto em marketing, mas não vejo retorno claro",
        "Tenho dificuldade para atrair novos clientes",
        "Recebo contatos, mas poucos viram clientes",
        "Quero crescer com mais previsibilidade",
      ],
    },
    procedimentos_mes: {
      title: "Qual é o faturamento médio mensal da empresa?",
      subtitle: "Uma faixa aproximada já ajuda a entender o momento do negócio.",
      options: ["Até R$5.000", "R$5.000 – R$20.000", "R$20.000 – R$50.000", "R$50.000 – R$100.000", "R$100.000 – R$500.000", "Acima de R$500.000"],
    },
    orcamento: {
      title: "Quanto consegue investir por mês em anúncios?",
      subtitle: "Considere apenas a verba de mídia, sem os honorários da agência.",
      options: ["Até R$1.500", "R$1.500 – R$3.000", "R$3.000 – R$6.000", "Acima de R$6.000"],
    },
    quando_comecar: {
      title: "Quando pretende começar?",
      subtitle: "Isso nos ajuda a entender o quanto faz sentido priorizar uma conversa agora.",
      options: ["Agora — já decidi", "Em breve — estou avaliando", "Ainda pesquisando — sem prazo"],
    },
  };

  return (
    <div>
      <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[hsl(42_100%_55%)] mb-2">
        {STEP_TITLES[currentStep]} — {sub + 1} de {STEPS.length}
      </p>
      <div className="flex gap-1 mb-8">
        {STEPS.map((_, i) => (
          <div key={i} className={`flex-1 h-0.5 transition-all duration-300 ${
            i < sub ? "bg-[hsl(42_100%_55%)]" : i === sub ? "bg-[hsl(42_100%_55%/0.5)]" : "bg-white/10"
          }`} />
        ))}
      </div>

      <div key={sub}>
        <h3 className="text-white text-xl sm:text-2xl font-display mb-2">{questions[currentStep].title}</h3>
        <p className="text-white/60 text-sm mb-5">{questions[currentStep].subtitle}</p>
        <div className="flex flex-col gap-2">
          {questions[currentStep].options.map(option => (
            <Option key={option} label={option} selected={watched[currentStep] === option} onClick={() => pickAndAdvance(currentStep, option)} />
          ))}
        </div>
        {errors[currentStep] && <p className="text-[hsl(42_100%_55%)] text-xs mt-2">{errors[currentStep]?.message}</p>}
      </div>

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
