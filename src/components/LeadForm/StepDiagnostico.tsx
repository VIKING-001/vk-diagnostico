import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const schema = z.object({
  tempo_mercado: z.string().min(1, "Campo obrigatório"),
  procedimentos_mes: z.string().min(1, "Campo obrigatório"),
  ticket_medio: z.string().min(1, "Campo obrigatório"),
  retorno_cliente: z.string().min(1, "Campo obrigatório"),
  fonte_clientes: z.string().min(1, "Campo obrigatório"),
  ciclo_vendas: z.string().min(1, "Campo obrigatório"),
  taxa_fechamento: z.string().min(1, "Campo obrigatório"),
  campanhas_pagas: z.string().min(1, "Campo obrigatório"),
  melhor_resultado: z.string().min(1, "Campo obrigatório"),
  prova_social: z.string().min(1, "Selecione uma opção"),
  diferencial: z.string().min(1, "Campo obrigatório"),
  case_marcante: z.string().min(1, "Campo obrigatório"),
  capacidade_fechamento: z.string().min(1, "Campo obrigatório"),
  objetivo_90_dias: z.string().min(1, "Campo obrigatório"),
});

type DiagData = z.infer<typeof schema>;

const inputCls = "w-full bg-white/5 border border-white/10 text-white placeholder-white/25 px-4 py-3 rounded-sm focus:outline-none focus:border-[hsl(42_100%_55%)] text-sm";
const taCls = `${inputCls} min-h-[90px] resize-none`;
const errorCls = "text-[hsl(42_100%_55%)] text-xs mt-1";
const labelCls = "block text-white/80 text-sm mb-2";

function RadioCard({ value, label, selected, onChange }: { value: string; label: string; selected: boolean; onChange: () => void }) {
  return (
    <label className={`flex items-center gap-3 p-3 border cursor-pointer transition-all duration-150 ${
      selected ? "border-[hsl(42_100%_55%)] bg-[hsl(42_100%_55%/0.1)] text-white" : "border-white/10 text-white/50 hover:border-white/25"
    }`}>
      <input type="radio" checked={selected} onChange={onChange} className="sr-only" />
      <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selected ? "border-[hsl(42_100%_55%)] bg-[hsl(42_100%_55%)]" : "border-white/30"}`} />
      <span className="text-sm">{label}</span>
    </label>
  );
}

interface Props {
  defaultValues: Partial<DiagData>;
  onNext: (data: DiagData) => void;
  onBack: () => void;
}

const SUB_STEPS = 4;
const subTitles = ["Sobre o seu negócio", "Sobre seus clientes atuais", "Marketing atual", "Diferencial e objetivos"];
const fieldsPerSub: (keyof DiagData)[][] = [
  ["tempo_mercado", "procedimentos_mes", "ticket_medio", "retorno_cliente"],
  ["fonte_clientes", "ciclo_vendas", "taxa_fechamento"],
  ["campanhas_pagas", "melhor_resultado", "prova_social"],
  ["diferencial", "case_marcante", "capacidade_fechamento", "objetivo_90_dias"],
];

export function StepDiagnostico({ defaultValues, onNext, onBack }: Props) {
  const [sub, setSub] = useState(0);
  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<DiagData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tempo_mercado: "", procedimentos_mes: "", ticket_medio: "", retorno_cliente: "",
      fonte_clientes: "", ciclo_vendas: "", taxa_fechamento: "",
      campanhas_pagas: "", melhor_resultado: "", prova_social: "",
      diferencial: "", case_marcante: "", capacidade_fechamento: "", objetivo_90_dias: "",
      ...defaultValues,
    },
    mode: "onBlur",
  });

  const watched = watch();

  async function handleSubNext() {
    const valid = await trigger(fieldsPerSub[sub]);
    if (!valid) return;
    if (sub < SUB_STEPS - 1) setSub(sub + 1);
    else handleSubmit(onNext)();
  }

  return (
    <div className="space-y-1">
      <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[hsl(42_100%_55%)] mb-6">
        {subTitles[sub]} — parte {sub + 1} de {SUB_STEPS}
      </p>

      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="space-y-5">

          {sub === 0 && (
            <>
              <div><label className={labelCls}>Quanto tempo você está no mercado?</label><input {...register("tempo_mercado")} placeholder="Ex: 3 anos" className={inputCls} />{errors.tempo_mercado && <p className={errorCls}>{errors.tempo_mercado.message}</p>}</div>
              <div><label className={labelCls}>Quantos clientes/projetos fecha por mês em média?</label><input {...register("procedimentos_mes")} placeholder="Ex: 8 clientes por mês" className={inputCls} />{errors.procedimentos_mes && <p className={errorCls}>{errors.procedimentos_mes.message}</p>}</div>
              <div><label className={labelCls}>Qual é o ticket médio? (mínimo e máximo)</label><input {...register("ticket_medio")} placeholder="Ex: mínimo R$800, máximo R$3.000" className={inputCls} />{errors.ticket_medio && <p className={errorCls}>{errors.ticket_medio.message}</p>}</div>
              <div><label className={labelCls}>Seu cliente volta a comprar? Qual a taxa aproximada?</label><input {...register("retorno_cliente")} placeholder="Ex: 40% volta, ou 'raramente'" className={inputCls} />{errors.retorno_cliente && <p className={errorCls}>{errors.retorno_cliente.message}</p>}</div>
            </>
          )}

          {sub === 1 && (
            <>
              <div><label className={labelCls}>De onde vêm seus clientes hoje? Qual a principal fonte?</label><textarea {...register("fonte_clientes")} placeholder="Ex: 60% indicação, 30% Instagram, 10% Google" className={taCls} />{errors.fonte_clientes && <p className={errorCls}>{errors.fonte_clientes.message}</p>}</div>
              <div><label className={labelCls}>Do primeiro contato ao fechamento, quanto tempo demora?</label><input {...register("ciclo_vendas")} placeholder="Ex: 3 dias, 1 semana..." className={inputCls} />{errors.ciclo_vendas && <p className={errorCls}>{errors.ciclo_vendas.message}</p>}</div>
              <div><label className={labelCls}>De 10 pessoas que te contatam, quantas fecham?</label><input {...register("taxa_fechamento")} placeholder="Ex: 3 em 10" className={inputCls} />{errors.taxa_fechamento && <p className={errorCls}>{errors.taxa_fechamento.message}</p>}</div>
            </>
          )}

          {sub === 2 && (
            <>
              <div><label className={labelCls}>Você faz campanhas pagas? Plataforma + investimento/mês?</label><textarea {...register("campanhas_pagas")} placeholder="Ex: Meta Ads, R$800/mês — ou 'nunca fiz'" className={taCls} />{errors.campanhas_pagas && <p className={errorCls}>{errors.campanhas_pagas.message}</p>}</div>
              <div><label className={labelCls}>Qual o melhor resultado que já teve com marketing?</label><textarea {...register("melhor_resultado")} placeholder="Se nunca fez, o que te impediu até hoje?" className={taCls} />{errors.melhor_resultado && <p className={errorCls}>{errors.melhor_resultado.message}</p>}</div>
              <div>
                <label className={labelCls}>Você tem prova social? (depoimentos, resultados, antes/depois)</label>
                <div className="flex flex-col gap-2 mt-1">
                  {["Tenho bastante", "Tenho alguns", "Tenho pouco", "Não tenho"].map(o => (
                    <RadioCard key={o} value={o} label={o} selected={watched.prova_social === o} onChange={() => setValue("prova_social", o, { shouldValidate: true })} />
                  ))}
                </div>
                {errors.prova_social && <p className={errorCls}>{errors.prova_social.message}</p>}
              </div>
            </>
          )}

          {sub === 3 && (
            <>
              <div><label className={labelCls}>Por que as pessoas escolhem você e não o concorrente?</label><textarea {...register("diferencial")} placeholder="Se eu fosse um cliente e perguntasse, o que você diria em 2 frases?" className={taCls} />{errors.diferencial && <p className={errorCls}>{errors.diferencial.message}</p>}</div>
              <div><label className={labelCls}>Você tem algum case de resultado marcante para usar como exemplo?</label><textarea {...register("case_marcante")} placeholder="Um cliente ou projeto que deu muito certo" className={taCls} />{errors.case_marcante && <p className={errorCls}>{errors.case_marcante.message}</p>}</div>
              <div><label className={labelCls}>Se tivesse 10 contatos qualificados por dia, quantos você fecharia?</label><input {...register("capacidade_fechamento")} placeholder="Ex: 3 em 10" className={inputCls} />{errors.capacidade_fechamento && <p className={errorCls}>{errors.capacidade_fechamento.message}</p>}</div>
              <div><label className={labelCls}>Qual é o seu objetivo nos próximos 90 dias?</label><textarea {...register("objetivo_90_dias")} placeholder="Seja específico — número de clientes, faturamento, etc." className={taCls} />{errors.objetivo_90_dias && <p className={errorCls}>{errors.objetivo_90_dias.message}</p>}</div>
            </>
          )}

        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={() => sub === 0 ? onBack() : setSub(sub - 1)} className="flex-1 border border-white/15 text-white/50 font-bold text-xs tracking-widest uppercase py-4 rounded-sm hover:border-white/30 hover:text-white/70 transition-colors duration-200">← Voltar</button>
        <button type="button" onClick={handleSubNext} className="flex-[2] bg-[hsl(42_100%_55%)] text-[hsl(222_47%_5%)] font-bold text-sm tracking-widest uppercase py-4 rounded-sm hover:opacity-90 transition-opacity duration-200">
          {sub === SUB_STEPS - 1 ? "Enviar diagnóstico →" : "Continuar →"}
        </button>
      </div>
    </div>
  );
}
