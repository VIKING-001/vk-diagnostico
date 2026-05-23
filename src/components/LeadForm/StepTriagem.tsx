import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const schema = z.object({
  negocio:            z.string().min(3, "Conta um pouco sobre o que você faz"),
  segmento:           z.string().min(1, "Selecione um segmento"),
  desafio:            z.string().min(1, "Selecione uma opção"),
  marketing_anterior: z.string().min(1, "Selecione uma opção"),
  orcamento:          z.string().min(1, "Selecione uma opção"),
  quando_comecar:     z.string().min(1, "Selecione uma opção"),
});

type TriagemData = z.infer<typeof schema>;

const inputCls = "w-full bg-white/5 border border-white/10 text-white placeholder-white/25 px-4 py-3 rounded-sm focus:outline-none focus:border-[hsl(42_100%_55%)] text-sm";
const errorCls = "text-[hsl(42_100%_55%)] text-xs mt-1";
const labelCls = "block text-white/80 text-sm mb-2";
const catCls   = "text-[0.6rem] tracking-[0.18em] uppercase text-[hsl(42_100%_55%)] mt-3 mb-1 col-span-2";

function RadioCard({ label, selected, onChange }: { label: string; selected: boolean; onChange: () => void }) {
  return (
    <label className={`flex items-center gap-3 p-3 border cursor-pointer transition-all duration-150 ${
      selected ? "border-[hsl(42_100%_55%)] bg-[hsl(42_100%_55%/0.1)] text-white" : "border-white/10 text-white/50 hover:border-white/25"
    }`}>
      <input type="radio" checked={selected} onChange={onChange} className="sr-only" />
      <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${selected ? "border-[hsl(42_100%_55%)] bg-[hsl(42_100%_55%)]" : "border-white/30"}`} />
      <span className="text-sm leading-tight">{label}</span>
    </label>
  );
}

const SEGMENTO_GRUPOS = [
  { cat: "🍔 Alimentação",        itens: ["Restaurante / Lanchonete", "Delivery / Dark Kitchen", "Bar / Churrascaria / Buffet", "Confeitaria / Padaria / Café"] },
  { cat: "🏥 Saúde & Bem-estar",  itens: ["Clínica Médica / Hospital", "Odontologia", "Psicologia / Terapia", "Estética / Beleza / Salão", "Academia / Personal Trainer / Pilates", "Farmácia / Suplementos", "Nutrição / Bem-estar"] },
  { cat: "📚 Educação",           itens: ["Escola / Curso Presencial", "Curso Online / Infoproduto", "Coaching / Mentoria"] },
  { cat: "🛍️ Comércio & Varejo", itens: ["Varejo Físico (loja)", "E-commerce", "Moda / Roupas / Acessórios", "Pet Shop / Veterinário", "Automotivo / Veículos"] },
  { cat: "🏠 Imóveis & Construção", itens: ["Imobiliária / Corretor", "Construção / Incorporadora", "Arquitetura / Design de Interiores", "Reforma / Acabamento"] },
  { cat: "⚖️ Profissionais Liberais", itens: ["Advocacia / Direito", "Contabilidade / Financeiro", "Consultoria Empresarial", "Engenharia / Projetos"] },
  { cat: "💻 Tecnologia & Digital", itens: ["Tecnologia / SaaS / Software", "Agência / Marketing Digital", "Freelancer / Criador de Conteúdo"] },
  { cat: "🚀 Outros",             itens: ["Segurança / Vigilância", "Logística / Transporte / Frete", "Turismo / Hotelaria / Viagem", "Eventos / Casamentos / Formaturas", "Energia Solar", "Franquia", "Indústria / Manufatura", "Outro"] },
];

const SUB_STEPS = 3;
const fieldsPerSub: (keyof TriagemData)[][] = [
  ["negocio", "segmento"],
  ["desafio", "marketing_anterior"],
  ["orcamento", "quando_comecar"],
];
const subTitles = ["Seu negócio", "Seu momento", "Seu plano"];

interface Props {
  defaultValues: Partial<TriagemData>;
  onNext: (data: TriagemData, qualificado: boolean) => void;
}

export function StepTriagem({ defaultValues, onNext }: Props) {
  const [sub, setSub] = useState(0);

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<TriagemData>({
    resolver: zodResolver(schema),
    defaultValues: { negocio: "", segmento: "", desafio: "", marketing_anterior: "", orcamento: "", quando_comecar: "", ...defaultValues },
    mode: "onBlur",
  });

  const watched = watch();

  async function handleSubNext() {
    const valid = await trigger(fieldsPerSub[sub]);
    if (!valid) return;
    if (sub < SUB_STEPS - 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setSub(sub + 1);
    } else {
      handleSubmit((data) => {
        const qualificado = !(data.quando_comecar === "Ainda pesquisando — sem prazo" && data.orcamento === "Até R$1.500");
        onNext(data, qualificado);
      })();
    }
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

          {/* ── PARTE 1 — Seu negócio ── */}
          {sub === 0 && <>
            <div>
              <label className={labelCls}>O que você faz e o que vende?</label>
              <p className="text-white/30 text-xs mb-2">Pode ser qualquer negócio — produto, serviço, presencial ou online.</p>
              <input {...register("negocio")} placeholder="Ex: Tenho uma hamburgueria, sou consultor financeiro..." className={inputCls} />
              {errors.negocio && <p className={errorCls}>{errors.negocio.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Qual é o segmento do seu negócio?</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {SEGMENTO_GRUPOS.map(grupo => (
                  <div key={grupo.cat} className="contents">
                    <p className={catCls}>{grupo.cat}</p>
                    {grupo.itens.map(item => (
                      <RadioCard key={item} label={item} selected={watched.segmento === item} onChange={() => setValue("segmento", item, { shouldValidate: true })} />
                    ))}
                  </div>
                ))}
              </div>
              {errors.segmento && <p className={errorCls}>{errors.segmento.message}</p>}
            </div>
          </>}

          {/* ── PARTE 2 — Seu momento ── */}
          {sub === 1 && <>
            <div>
              <label className={labelCls}>Qual é o maior desafio no seu negócio agora?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {["Atrair mais clientes", "Converter melhor os que chegam", "Estruturar e fortalecer a marca", "Crescer com consistência"].map(o => (
                  <RadioCard key={o} label={o} selected={watched.desafio === o} onChange={() => setValue("desafio", o, { shouldValidate: true })} />
                ))}
              </div>
              {errors.desafio && <p className={errorCls}>{errors.desafio.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Você já investiu em marketing digital antes?</label>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                {["Sim, já investi", "Não, nunca investi"].map(o => (
                  <RadioCard key={o} label={o} selected={watched.marketing_anterior === o} onChange={() => setValue("marketing_anterior", o, { shouldValidate: true })} />
                ))}
              </div>
              {errors.marketing_anterior && <p className={errorCls}>{errors.marketing_anterior.message}</p>}
            </div>
          </>}

          {/* ── PARTE 3 — Seu plano ── */}
          {sub === 2 && <>
            <div>
              <label className={labelCls}>Qual é o orçamento mensal disponível para marketing?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {["Até R$1.500", "R$1.500 – R$3.000", "R$3.000 – R$6.000", "Acima de R$6.000"].map(o => (
                  <RadioCard key={o} label={o} selected={watched.orcamento === o} onChange={() => setValue("orcamento", o, { shouldValidate: true })} />
                ))}
              </div>
              {errors.orcamento && <p className={errorCls}>{errors.orcamento.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Quando você quer começar?</label>
              <p className="text-white/30 text-xs mb-2">Seja honesto — isso não elimina ninguém, só ajuda a gente a priorizar.</p>
              <div className="flex flex-col gap-2">
                {["Agora — já decidi", "Em breve — estou avaliando", "Ainda pesquisando — sem prazo"].map(o => (
                  <RadioCard key={o} label={o} selected={watched.quando_comecar === o} onChange={() => setValue("quando_comecar", o, { shouldValidate: true })} />
                ))}
              </div>
              {errors.quando_comecar && <p className={errorCls}>{errors.quando_comecar.message}</p>}
            </div>
          </>}

        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 pt-4">
        {sub > 0 && (
          <button type="button" onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setSub(sub - 1); }}
            className="flex-1 border border-white/15 text-white/50 font-bold text-xs tracking-widest uppercase py-4 rounded-sm hover:border-white/30 hover:text-white/70 transition-colors duration-200">
            ← Voltar
          </button>
        )}
        <button type="button" onClick={handleSubNext}
          className="flex-[2] bg-[hsl(42_100%_55%)] text-[hsl(222_47%_5%)] font-bold text-sm tracking-widest uppercase py-4 rounded-sm hover:opacity-90 transition-opacity duration-200">
          {sub === SUB_STEPS - 1 ? "Continuar →" : "Continuar →"}
        </button>
      </div>
    </div>
  );
}
