import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const schema = z.object({
  tempo_mercado:        z.string().min(1, "Campo obrigatório"),
  procedimentos_mes:    z.string().min(1, "Campo obrigatório"),
  ticket_medio:         z.string().min(1, "Campo obrigatório"),
  retorno_cliente:      z.string().min(1, "Campo obrigatório"),
  fonte_clientes:       z.string().min(1, "Campo obrigatório"),
  ciclo_vendas:         z.string().min(1, "Campo obrigatório"),
  taxa_fechamento:      z.string().min(1, "Campo obrigatório"),
  campanhas_pagas:      z.string().min(1, "Campo obrigatório"),
  melhor_resultado:     z.string().min(1, "Campo obrigatório"),
  prova_social:         z.string().min(1, "Selecione uma opção"),
  diferencial:          z.string().min(1, "Campo obrigatório"),
  case_marcante:        z.string().min(1, "Campo obrigatório"),
  capacidade_fechamento:z.string().min(1, "Campo obrigatório"),
  objetivo_90_dias:     z.string().min(1, "Campo obrigatório"),
});

type DiagData = z.infer<typeof schema>;

const inputCls  = "w-full bg-white/5 border border-white/10 text-white placeholder-white/25 px-4 py-3 rounded-sm focus:outline-none focus:border-[hsl(42_100%_55%)] text-sm";
const taCls     = `${inputCls} min-h-[90px] resize-none`;
const errorCls  = "text-[hsl(42_100%_55%)] text-xs mt-1";
const labelCls  = "block text-white/80 text-sm mb-1";
const hintCls   = "text-white/30 text-xs mb-2";

function RadioCard({ label, selected, onChange }: { label: string; selected: boolean; onChange: () => void }) {
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
  tipo_negocio?: string;
  onNext: (data: DiagData) => void;
  onBack: () => void;
}

const SUB_STEPS = 4;
const subTitles = ["Números do negócio", "Clientes e vendas", "Marketing atual", "Diferencial e objetivos"];

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
        <motion.div
          key={sub}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >

          {/* ── PARTE 1 — Números do negócio ── */}
          {sub === 0 && <>
            <div>
              <label className={labelCls}>Há quanto tempo você está no mercado?</label>
              <input {...register("tempo_mercado")} placeholder="Ex: 3 anos, desde 2021" className={inputCls} />
              {errors.tempo_mercado && <p className={errorCls}>{errors.tempo_mercado.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Qual é o seu faturamento médio mensal hoje?</label>
              <p className={hintCls}>Seja sincero — isso ajuda a indicar a solução certa pro seu momento.</p>
              <div className="flex flex-col gap-2 mt-2">
                {["Até R$5.000", "R$5.000 – R$20.000", "R$20.000 – R$50.000", "R$50.000 – R$100.000", "R$100.000 – R$500.000", "Acima de R$500.000"].map(o => (
                  <RadioCard key={o} label={o} selected={watched.procedimentos_mes === o} onChange={() => setValue("procedimentos_mes", o, { shouldValidate: true })} />
                ))}
              </div>
              {errors.procedimentos_mes && <p className={errorCls}>{errors.procedimentos_mes.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Qual é o seu ticket médio por venda, atendimento ou contrato?</label>
              <p className={hintCls}>O valor que cada cliente paga de uma vez (ou por mês, se for recorrente).</p>
              <input {...register("ticket_medio")} placeholder="Ex: R$200 por atendimento, R$1.500/mês por cliente, R$80 por pedido" className={inputCls} />
              {errors.ticket_medio && <p className={errorCls}>{errors.ticket_medio.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Com que frequência o mesmo cliente compra ou volta?</label>
              <input {...register("retorno_cliente")} placeholder="Ex: a cada 30 dias, semanalmente, pontual (compra uma vez), raramente" className={inputCls} />
              {errors.retorno_cliente && <p className={errorCls}>{errors.retorno_cliente.message}</p>}
            </div>
          </>}

          {/* ── PARTE 2 — Clientes e vendas ── */}
          {sub === 1 && <>
            <div>
              <label className={labelCls}>De onde vêm seus clientes hoje? Como eles te encontram?</label>
              <p className={hintCls}>Se souber o percentual aproximado de cada canal, melhor ainda.</p>
              <textarea {...register("fonte_clientes")} placeholder="Ex: 60% indicação, 30% Instagram, 10% Google — ou 'a maioria vem por indicação'" className={taCls} />
              {errors.fonte_clientes && <p className={errorCls}>{errors.fonte_clientes.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Do primeiro contato até a venda fechada, quanto tempo costuma levar?</label>
              <p className={hintCls}>Pode ser segundos (compra impulsiva) ou semanas (venda consultiva).</p>
              <input {...register("ciclo_vendas")} placeholder="Ex: compra na hora, 3 dias, 2 semanas de negociação" className={inputCls} />
              {errors.ciclo_vendas && <p className={errorCls}>{errors.ciclo_vendas.message}</p>}
            </div>

            <div>
              <label className={labelCls}>De cada 10 pessoas que entram em contato ou chegam até você, quantas compram?</label>
              <p className={hintCls}>Se for presencial (restaurante, loja), pense em quantas entram e saem sem comprar.</p>
              <input {...register("taxa_fechamento")} placeholder="Ex: 7 em 10, 3 em 10, quase todos que chegam acabam comprando" className={inputCls} />
              {errors.taxa_fechamento && <p className={errorCls}>{errors.taxa_fechamento.message}</p>}
            </div>
          </>}

          {/* ── PARTE 3 — Marketing atual ── */}
          {sub === 2 && <>
            <div>
              <label className={labelCls}>Você já investe em divulgação paga? Onde e quanto por mês?</label>
              <textarea {...register("campanhas_pagas")} placeholder="Ex: Meta Ads R$800/mês, Google Ads R$500/mês, iFood Ads R$300/mês — ou 'nunca fiz nada pago'" className={taCls} />
              {errors.campanhas_pagas && <p className={errorCls}>{errors.campanhas_pagas.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Qual foi o melhor resultado que você já teve com qualquer ação de marketing ou divulgação?</label>
              <p className={hintCls}>Pode ser um post orgânico, uma promoção, um influenciador, uma campanha paga — qualquer coisa que funcionou.</p>
              <textarea {...register("melhor_resultado")} placeholder="Ex: uma promoção de aniversário triplicou as vendas naquela semana / nunca fiz nada estruturado" className={taCls} />
              {errors.melhor_resultado && <p className={errorCls}>{errors.melhor_resultado.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Você tem prova social? (depoimentos, avaliações, cases, antes/depois, fotos de clientes)</label>
              <div className="flex flex-col gap-2 mt-2">
                {["Tenho bastante — uso ativamente", "Tenho alguns — mas não uso direito", "Tenho pouco — está espalhado", "Não tenho nada estruturado"].map(o => (
                  <RadioCard key={o} label={o} selected={watched.prova_social === o} onChange={() => setValue("prova_social", o, { shouldValidate: true })} />
                ))}
              </div>
              {errors.prova_social && <p className={errorCls}>{errors.prova_social.message}</p>}
            </div>
          </>}

          {/* ── PARTE 4 — Diferencial e objetivos ── */}
          {sub === 3 && <>
            <div>
              <label className={labelCls}>Por que as pessoas escolhem você e não um concorrente? O que te diferencia?</label>
              <p className={hintCls}>Pense no que seus melhores clientes dizem quando indicam você.</p>
              <textarea {...register("diferencial")} placeholder="Ex: entrego mais rápido, meu produto é artesanal, atendo de forma personalizada, tenho preço mais justo..." className={taCls} />
              {errors.diferencial && <p className={errorCls}>{errors.diferencial.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Você tem algum resultado marcante — de cliente, venda ou projeto — que poderia ser usado como case?</label>
              <textarea {...register("case_marcante")} placeholder="Ex: cliente que dobrou o faturamento, produto que esgotou, campanha que viralizou, transformação de um cliente" className={taCls} />
              {errors.case_marcante && <p className={errorCls}>{errors.case_marcante.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Se a demanda dobrasse amanhã, você teria estrutura para atender sem perder qualidade?</label>
              <input {...register("capacidade_fechamento")} placeholder="Ex: sim, tenho capacidade / não, precisaria contratar ou ampliar / depende do quanto" className={inputCls} />
              {errors.capacidade_fechamento && <p className={errorCls}>{errors.capacidade_fechamento.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Qual é o seu objetivo nos próximos 90 dias?</label>
              <p className={hintCls}>Quanto mais específico em números, melhor — faturamento, clientes, ticket, expansão.</p>
              <textarea {...register("objetivo_90_dias")} placeholder="Ex: quero sair de R$15k para R$30k/mês, dobrar o número de clientes, abrir uma unidade nova..." className={taCls} />
              {errors.objetivo_90_dias && <p className={errorCls}>{errors.objetivo_90_dias.message}</p>}
            </div>
          </>}

        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => sub === 0 ? onBack() : setSub(sub - 1)}
          className="flex-1 border border-white/15 text-white/50 font-bold text-xs tracking-widest uppercase py-4 rounded-sm hover:border-white/30 hover:text-white/70 transition-colors duration-200"
        >
          ← Voltar
        </button>
        <button
          type="button"
          onClick={handleSubNext}
          className="flex-[2] bg-[hsl(42_100%_55%)] text-[hsl(222_47%_5%)] font-bold text-sm tracking-widest uppercase py-4 rounded-sm hover:opacity-90 transition-opacity duration-200"
        >
          {sub === SUB_STEPS - 1 ? "Enviar diagnóstico →" : "Continuar →"}
        </button>
      </div>
    </div>
  );
}
