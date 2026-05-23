import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  negocio:            z.string().min(3, "Conta um pouco sobre o que você faz"),
  segmento:           z.string().min(1, "Selecione um segmento"),
  desafio:            z.string().min(1, "Selecione uma opção"),
  marketing_anterior: z.string().min(1, "Selecione uma opção"),
  orcamento:          z.string().min(1, "Selecione uma opção"),
  quando_comecar:     z.string().min(1, "Selecione uma opção"),
});

type TriagemData = z.infer<typeof schema>;

const inputCls  = "w-full bg-white/5 border border-white/10 text-white placeholder-white/25 px-4 py-3 rounded-sm focus:outline-none focus:border-[hsl(42_100%_55%)] text-sm";
const errorCls  = "text-[hsl(42_100%_55%)] text-xs mt-1";
const labelCls  = "block text-white/80 text-sm mb-2";
const selectCls = "w-full bg-[hsl(222_47%_7%)] border border-white/10 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-[hsl(42_100%_55%)] text-sm cursor-pointer";

function RadioCard({ value, label, selected, onChange }: { value: string; label: string; selected: boolean; onChange: () => void }) {
  return (
    <label className={`flex items-center gap-3 p-4 border cursor-pointer transition-all duration-150 ${
      selected ? "border-[hsl(42_100%_55%)] bg-[hsl(42_100%_55%/0.1)] text-white" : "border-white/10 text-white/50 hover:border-white/25"
    }`}>
      <input type="radio" value={value} checked={selected} onChange={onChange} className="sr-only" />
      <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selected ? "border-[hsl(42_100%_55%)] bg-[hsl(42_100%_55%)]" : "border-white/30"}`} />
      <span className="text-sm">{label}</span>
    </label>
  );
}

const SEGMENTOS = [
  "Serviço", "Varejo", "Food Service / Restaurante", "E-commerce",
  "Educação", "Saúde / Estética / Beleza", "Imobiliária",
  "Finanças / Contabilidade", "Construção / Reforma",
  "Agência / Marketing", "Tecnologia / SaaS", "Indústria", "Outro",
];

interface Props {
  defaultValues: Partial<TriagemData>;
  onNext: (data: TriagemData, qualificado: boolean) => void;
}

export function StepTriagem({ defaultValues, onNext }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TriagemData>({
    resolver: zodResolver(schema),
    defaultValues: { negocio: "", segmento: "", desafio: "", marketing_anterior: "", orcamento: "", quando_comecar: "", ...defaultValues },
  });

  const watched = watch();

  function onSubmit(data: TriagemData) {
    const qualificado = !(data.quando_comecar === "Ainda pesquisando — sem prazo" && data.orcamento === "Até R$1.500");
    onNext(data, qualificado);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* Q1 — o que faz */}
      <div>
        <label className={labelCls}>O que você faz e o que vende?</label>
        <p className="text-white/30 text-xs mb-2">Pode ser qualquer negócio — produto, serviço, atendimento presencial ou online.</p>
        <input {...register("negocio")} placeholder="Ex: Tenho uma hamburgueria, sou consultor financeiro, vendo roupas online..." className={inputCls} />
        {errors.negocio && <p className={errorCls}>{errors.negocio.message}</p>}
      </div>

      {/* Q2 — segmento */}
      <div>
        <label className={labelCls}>Qual é o segmento do seu negócio?</label>
        <select {...register("segmento")} className={selectCls}
          style={{ backgroundColor: "hsl(222 47% 7%)" }}>
          <option value="" disabled>Selecione o segmento...</option>
          {SEGMENTOS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {errors.segmento && <p className={errorCls}>{errors.segmento.message}</p>}
      </div>

      {/* Q3 — desafio */}
      <div>
        <label className={labelCls}>Qual é o maior desafio no seu negócio agora?</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {["Atrair mais clientes", "Converter melhor os que chegam", "Estruturar e fortalecer a marca", "Crescer com consistência"].map(o => (
            <RadioCard key={o} value={o} label={o} selected={watched.desafio === o} onChange={() => setValue("desafio", o, { shouldValidate: true })} />
          ))}
        </div>
        {errors.desafio && <p className={errorCls}>{errors.desafio.message}</p>}
      </div>

      {/* Q4 — marketing anterior */}
      <div>
        <label className={labelCls}>Você já investiu em marketing digital antes?</label>
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          {["Sim, já investi", "Não, nunca investi"].map(o => (
            <RadioCard key={o} value={o} label={o} selected={watched.marketing_anterior === o} onChange={() => setValue("marketing_anterior", o, { shouldValidate: true })} />
          ))}
        </div>
        {errors.marketing_anterior && <p className={errorCls}>{errors.marketing_anterior.message}</p>}
      </div>

      {/* Q5 — orçamento */}
      <div>
        <label className={labelCls}>Qual é o orçamento mensal disponível para marketing?</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {["Até R$1.500", "R$1.500 – R$3.000", "R$3.000 – R$6.000", "Acima de R$6.000"].map(o => (
            <RadioCard key={o} value={o} label={o} selected={watched.orcamento === o} onChange={() => setValue("orcamento", o, { shouldValidate: true })} />
          ))}
        </div>
        {errors.orcamento && <p className={errorCls}>{errors.orcamento.message}</p>}
      </div>

      {/* Q6 — quando comecar */}
      <div>
        <label className={labelCls}>Quando você quer começar?</label>
        <p className="text-white/30 text-xs mb-2">Seja honesto — isso não elimina ninguém, só ajuda a gente a priorizar.</p>
        <div className="flex flex-col gap-2">
          {["Agora — já decidi", "Em breve — estou avaliando", "Ainda pesquisando — sem prazo"].map(o => (
            <RadioCard key={o} value={o} label={o} selected={watched.quando_comecar === o} onChange={() => setValue("quando_comecar", o, { shouldValidate: true })} />
          ))}
        </div>
        {errors.quando_comecar && <p className={errorCls}>{errors.quando_comecar.message}</p>}
      </div>

      <button type="submit" className="w-full bg-[hsl(42_100%_55%)] text-[hsl(222_47%_5%)] font-bold text-sm tracking-widest uppercase py-4 rounded-sm hover:opacity-90 transition-opacity duration-200">
        Continuar →
      </button>
    </form>
  );
}
