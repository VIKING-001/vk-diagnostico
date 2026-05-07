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
  prova_social: z.string().min(1, "Campo obrigatório"),
  diferencial: z.string().min(1, "Campo obrigatório"),
  case_marcante: z.string().min(1, "Campo obrigatório"),
  capacidade_fechamento: z.string().min(1, "Campo obrigatório"),
  objetivo_90_dias: z.string().min(1, "Campo obrigatório"),
});

type DiagData = z.infer<typeof schema>;

type Field = keyof DiagData;

interface Question {
  field: Field;
  label: string;
  placeholder: string;
  type: "input" | "textarea" | "radio";
  options?: string[];
}

// ─── Sets de perguntas por tipo de negócio ───────────────────────────────────

const SETS: Record<string, { subTitles: string[]; subs: Question[][] }> = {

  restaurante: {
    subTitles: ["Sobre o negócio", "Operação e canais", "Marketing atual", "Diferencial e objetivos"],
    subs: [
      [
        { field: "tempo_mercado",      type: "input",    label: "Há quanto tempo o negócio está em funcionamento?",                       placeholder: "Ex: 2 anos, desde 2022" },
        { field: "procedimentos_mes",  type: "input",    label: "Quantos pedidos ou atendimentos você realiza por dia em média?",          placeholder: "Ex: 80 pedidos/dia no delivery, 30 mesas aos fins de semana" },
        { field: "ticket_medio",       type: "input",    label: "Qual é o ticket médio por pedido ou por mesa?",                          placeholder: "Ex: R$35 no delivery, R$80 por mesa" },
        { field: "retorno_cliente",    type: "input",    label: "Com que frequência o mesmo cliente costuma voltar?",                     placeholder: "Ex: 2x por semana, todo fim de semana, raramente" },
      ],
      [
        { field: "fonte_clientes",     type: "textarea", label: "Quais são seus principais canais de venda?",                             placeholder: "Ex: 60% iFood, 30% WhatsApp, 10% presencial" },
        { field: "ciclo_vendas",       type: "textarea", label: "Qual é o seu horário de pico e qual é a sua capacidade máxima de atendimento?", placeholder: "Ex: pico 19h–21h, consigo atender 50 pedidos/h" },
        { field: "taxa_fechamento",    type: "input",    label: "Qual é a sua nota no Google ou iFood? Quantas avaliações você tem?",     placeholder: "Ex: 4.8 no iFood com 320 avaliações" },
      ],
      [
        { field: "campanhas_pagas",    type: "textarea", label: "Você investe em divulgação paga? Qual plataforma e quanto por mês?",     placeholder: "Ex: Instagram Ads R$600/mês, iFood Ads R$300/mês — ou 'nunca fiz'" },
        { field: "melhor_resultado",   type: "textarea", label: "Qual foi o melhor resultado com uma ação de marketing ou promoção?",     placeholder: "Ex: combo do Dia dos Namorados dobrou as vendas naquela semana" },
        { field: "prova_social",       type: "textarea", label: "Você tem fotos profissionais, vídeos ou já foi divulgado por influenciadores?", placeholder: "Ex: 3 reels com +50k views, 2 influenciadores locais já foram" },
      ],
      [
        { field: "diferencial",        type: "textarea", label: "Por que as pessoas escolhem você e não a concorrência mais próxima?",    placeholder: "Ex: receita exclusiva, atendimento rápido, ambiente único" },
        { field: "case_marcante",      type: "textarea", label: "Alguma promoção, produto ou ação que viralizou ou gerou muito resultado?", placeholder: "Ex: o 'X-Burguer da semana' esgotou em 2h e teve fila na porta" },
        { field: "capacidade_fechamento", type: "input", label: "Se a demanda dobrasse amanhã, você conseguiria atender sem perder qualidade?", placeholder: "Ex: sim, teria que contratar mais 2 entregadores / não, a cozinha não suporta" },
        { field: "objetivo_90_dias",   type: "textarea", label: "Qual é o seu objetivo nos próximos 90 dias?",                           placeholder: "Ex: aumentar faturamento em 40%, abrir segunda unidade, entrar no iFood premium" },
      ],
    ],
  },

  presencial: {
    subTitles: ["Sobre o negócio", "Agenda e clientes", "Marketing atual", "Diferencial e objetivos"],
    subs: [
      [
        { field: "tempo_mercado",      type: "input",    label: "Há quanto tempo você está no mercado?",                                  placeholder: "Ex: 4 anos, desde 2020" },
        { field: "procedimentos_mes",  type: "input",    label: "Quantos atendimentos você realiza por mês?",                             placeholder: "Ex: 120 atendimentos/mês, ou 6 por dia" },
        { field: "ticket_medio",       type: "input",    label: "Qual é o ticket médio por atendimento ou procedimento?",                 placeholder: "Ex: R$150 por corte+barba, R$300 por limpeza de pele" },
        { field: "retorno_cliente",    type: "input",    label: "Com que frequência o mesmo cliente volta? A cada quanto tempo?",         placeholder: "Ex: a cada 30 dias, semanalmente, maioria volta mensalmente" },
      ],
      [
        { field: "fonte_clientes",     type: "textarea", label: "Como os clientes chegam até você e como eles agendam?",                  placeholder: "Ex: 70% indicação, agendam pelo WhatsApp ou Instagram" },
        { field: "ciclo_vendas",       type: "textarea", label: "Sua agenda está sempre cheia ou tem horários vagos? Com quanto tempo de antecedência?", placeholder: "Ex: agenda cheia com 10 dias de antecedência, mas segunda e terça vazios" },
        { field: "taxa_fechamento",    type: "textarea", label: "Qual é a sua taxa de no-show ou cancelamentos? Isso te prejudica financeiramente?", placeholder: "Ex: 15% de no-show, perco uns R$800/mês com isso" },
      ],
      [
        { field: "campanhas_pagas",    type: "textarea", label: "Você faz campanhas pagas? Qual plataforma e quanto investe por mês?",    placeholder: "Ex: Meta Ads R$500/mês — ou 'nunca fiz, só posto orgânico'" },
        { field: "melhor_resultado",   type: "textarea", label: "Qual foi o melhor resultado que já teve com marketing ou divulgação?",   placeholder: "Ex: post de antes/depois viralizou e trouxe 40 novos clientes" },
        { field: "prova_social",       type: "textarea", label: "Você tem prova social ativa? (fotos de antes/depois, depoimentos, avaliações no Google)", placeholder: "Ex: 180 avaliações 5 estrelas no Google, perfil com 8k seguidores" },
      ],
      [
        { field: "diferencial",        type: "textarea", label: "Por que as pessoas te escolhem ao invés de outro profissional ou estabelecimento?", placeholder: "Ex: especialidade em cabelos cacheados, atendimento VIP, localização exclusiva" },
        { field: "case_marcante",      type: "textarea", label: "Você tem algum resultado transformador de cliente para usar como case?", placeholder: "Ex: cliente perdeu 18kg em 3 meses, antes/depois que viralizou" },
        { field: "capacidade_fechamento", type: "textarea", label: "Se a agenda enchesse completamente todos os dias, você tem estrutura para atender?", placeholder: "Ex: precisaria de mais 1 profissional, ou a estrutura atual aguenta" },
        { field: "objetivo_90_dias",   type: "textarea", label: "Qual é o seu objetivo nos próximos 90 dias?",                           placeholder: "Ex: lotar a agenda, lançar pacotes mensais, abrir uma segunda cadeira" },
      ],
    ],
  },

  consultivo: {
    subTitles: ["Sobre o negócio", "Sobre seus clientes", "Marketing atual", "Diferencial e objetivos"],
    subs: [
      [
        { field: "tempo_mercado",      type: "input",    label: "Há quanto tempo você está no mercado?",                                  placeholder: "Ex: 3 anos" },
        { field: "procedimentos_mes",  type: "input",    label: "Quantos clientes ou projetos você fecha por mês em média?",              placeholder: "Ex: 2 novos clientes/mês com contratos de 6 meses" },
        { field: "ticket_medio",       type: "input",    label: "Qual é o ticket médio? (mínimo e máximo)",                               placeholder: "Ex: mínimo R$3.000, máximo R$15.000/mês" },
        { field: "retorno_cliente",    type: "input",    label: "Seus clientes ficam por quanto tempo? Qual é a taxa de renovação?",      placeholder: "Ex: 80% renovam, ficam em média 8 meses" },
      ],
      [
        { field: "fonte_clientes",     type: "textarea", label: "De onde vêm seus clientes hoje? Qual a principal fonte?",               placeholder: "Ex: 70% indicação, 20% LinkedIn, 10% inbound" },
        { field: "ciclo_vendas",       type: "input",    label: "Do primeiro contato até a assinatura do contrato, quanto tempo demora?", placeholder: "Ex: 15 dias em média, às vezes 2 meses" },
        { field: "taxa_fechamento",    type: "input",    label: "De cada 10 reuniões ou propostas enviadas, quantas viram contrato?",     placeholder: "Ex: 3 em 10" },
      ],
      [
        { field: "campanhas_pagas",    type: "textarea", label: "Você faz campanhas pagas? Qual plataforma e quanto investe por mês?",    placeholder: "Ex: LinkedIn Ads R$2.000/mês, Google Ads R$1.500/mês — ou 'nunca fiz'" },
        { field: "melhor_resultado",   type: "textarea", label: "Qual o melhor resultado que já teve com marketing ou posicionamento?",   placeholder: "Ex: webinar trouxe 3 clientes, artigo no LinkedIn gerou 5 leads qualificados" },
        { field: "prova_social",       type: "textarea", label: "Você tem cases de resultados, depoimentos ou dados que usa na prospecção?", placeholder: "Ex: 3 cases publicados, NPS 92, depoimentos em vídeo" },
      ],
      [
        { field: "diferencial",        type: "textarea", label: "Por que os clientes escolhem você e não outro prestador ou agência?",    placeholder: "Ex: especialidade em nicho específico, metodologia proprietária, garantia de resultado" },
        { field: "case_marcante",      type: "textarea", label: "Qual é o case de resultado mais expressivo que você tem? Dados reais.", placeholder: "Ex: cliente X aumentou 180% o faturamento em 4 meses" },
        { field: "capacidade_fechamento", type: "input", label: "Se chegassem 5 novos clientes amanhã, você teria como atender todos com qualidade?", placeholder: "Ex: sim, tenho equipe / não, precisaria contratar" },
        { field: "objetivo_90_dias",   type: "textarea", label: "Qual é o seu objetivo nos próximos 90 dias?",                           placeholder: "Ex: fechar 3 novos contratos, chegar a R$50k MRR, contratar primeiro funcionário" },
      ],
    ],
  },

  ecommerce: {
    subTitles: ["Sobre o negócio", "Tráfego e canais", "Marketing atual", "Diferencial e objetivos"],
    subs: [
      [
        { field: "tempo_mercado",      type: "input",    label: "Há quanto tempo você vende online?",                                     placeholder: "Ex: 1 ano e meio, desde 2023" },
        { field: "procedimentos_mes",  type: "input",    label: "Quantos pedidos você processa por mês em média?",                       placeholder: "Ex: 200 pedidos/mês" },
        { field: "ticket_medio",       type: "input",    label: "Qual é o ticket médio por pedido?",                                     placeholder: "Ex: R$120 por pedido" },
        { field: "retorno_cliente",    type: "input",    label: "Qual é a sua taxa de recompra? Quantos % dos clientes voltam a comprar?", placeholder: "Ex: 30% dos clientes compram de novo dentro de 90 dias" },
      ],
      [
        { field: "fonte_clientes",     type: "textarea", label: "Quais são seus principais canais de venda e de onde vem seu tráfego?",  placeholder: "Ex: 50% Instagram, 30% marketplace, 20% tráfego orgânico" },
        { field: "ciclo_vendas",       type: "textarea", label: "Você sabe quantas pessoas visitam sua loja/perfil e quantas de fato compram?", placeholder: "Ex: 1.000 visitantes/mês, 2% convertem = 20 pedidos — ou 'não acompanho'" },
        { field: "taxa_fechamento",    type: "textarea", label: "Quanto você gasta em anúncios por mês em relação ao que fatura? Qual o ROAS?", placeholder: "Ex: gasto R$2.000 e fatura R$10.000 em vendas pagas (ROAS 5)" },
      ],
      [
        { field: "campanhas_pagas",    type: "textarea", label: "Você roda tráfego pago? Quais plataformas e qual orçamento mensal?",    placeholder: "Ex: Meta Ads R$1.500/mês, Google Shopping R$800/mês" },
        { field: "melhor_resultado",   type: "textarea", label: "Qual o melhor resultado que já teve com uma campanha ou ação de marketing?", placeholder: "Ex: Black Friday faturou R$30k em 3 dias, lançamento de produto esgotou em 24h" },
        { field: "prova_social",       type: "textarea", label: "Você tem avaliações, fotos de clientes usando o produto, ou UGC?",      placeholder: "Ex: 500+ avaliações positivas, 3 influenciadores já usaram, fotos repostadas" },
      ],
      [
        { field: "diferencial",        type: "textarea", label: "Por que alguém compraria de você ao invés de um concorrente ou marketplace?", placeholder: "Ex: produto exclusivo, prazo de entrega mais rápido, embalagem diferenciada" },
        { field: "case_marcante",      type: "textarea", label: "Você tem algum produto estrela, coleção ou campanha que gerou muito resultado?", placeholder: "Ex: produto X vendeu 500 unidades em uma semana, coleção esgotou em 48h" },
        { field: "capacidade_fechamento", type: "textarea", label: "Se triplicassem as vendas amanhã, seu estoque e operação de envio aguenta?", placeholder: "Ex: sim, tenho estoque / não, precisaria de 15 dias para repor" },
        { field: "objetivo_90_dias",   type: "textarea", label: "Qual é o seu objetivo nos próximos 90 dias?",                           placeholder: "Ex: dobrar o faturamento, lançar nova coleção, entrar em marketplace novo" },
      ],
    ],
  },

  autonomo: {
    subTitles: ["Sobre o negócio", "Prospecção e clientes", "Marketing e posicionamento", "Diferencial e objetivos"],
    subs: [
      [
        { field: "tempo_mercado",      type: "input",    label: "Há quanto tempo você atua como autônomo ou freelancer nessa área?",     placeholder: "Ex: 5 anos como fotógrafo independente" },
        { field: "procedimentos_mes",  type: "input",    label: "Quantos projetos ou clientes você consegue atender por mês?",           placeholder: "Ex: 4 casamentos/mês, 8 projetos de design, 3 clientes ativos de consultoria" },
        { field: "ticket_medio",       type: "input",    label: "Qual é o seu ticket médio por projeto ou serviço?",                     placeholder: "Ex: R$2.500 por casamento, R$800 por projeto de identidade visual" },
        { field: "retorno_cliente",    type: "textarea", label: "Você tem clientes recorrentes? Qual % do seu faturamento vem de clientes que voltam?", placeholder: "Ex: 40% dos meus clientes contratam mais de uma vez, mas a maioria é pontual" },
      ],
      [
        { field: "fonte_clientes",     type: "textarea", label: "De onde vêm seus clientes hoje? Como eles te encontram?",               placeholder: "Ex: 80% indicação de outros clientes, 15% Instagram, 5% LinkedIn" },
        { field: "ciclo_vendas",       type: "input",    label: "Do primeiro contato até o contrato assinado ou sinal pago, quanto tempo leva?", placeholder: "Ex: 1 semana em média, mas alguns fecham na hora" },
        { field: "taxa_fechamento",    type: "input",    label: "De cada 10 orçamentos ou propostas que você envia, quantos são aprovados?", placeholder: "Ex: 4 em 10, mas quando é indicação fecha quase sempre" },
      ],
      [
        { field: "campanhas_pagas",    type: "textarea", label: "Você investe em algum canal pago para conseguir clientes? Qual e quanto?", placeholder: "Ex: Instagram Ads R$400/mês — ou 'nunca fiz, tudo é indicação'" },
        { field: "melhor_resultado",   type: "textarea", label: "Qual foi o melhor resultado que já teve em termos de posicionamento ou aquisição de cliente?", placeholder: "Ex: um post de portfólio viralizou e trouxe 12 contatos em uma semana" },
        { field: "prova_social",       type: "textarea", label: "Você tem portfólio organizado, depoimentos ou cases que usa ativamente na hora de fechar?", placeholder: "Ex: portfólio no Behance com 10k views, 20 depoimentos no Instagram" },
      ],
      [
        { field: "diferencial",        type: "textarea", label: "Por que um cliente te escolheria ao invés de outro profissional com preço similar?", placeholder: "Ex: entrega mais rápida, estilo único, especialidade em nicho específico" },
        { field: "case_marcante",      type: "textarea", label: "Qual é o projeto ou resultado de cliente mais marcante da sua carreira até hoje?", placeholder: "Ex: identidade visual que ajudou cliente a triplicar o faturamento" },
        { field: "capacidade_fechamento", type: "input", label: "Se chegassem 5 novos clientes amanhã, você conseguiria atender todos sem comprometer a qualidade?", placeholder: "Ex: sim / não, tenho capacidade pra mais 2 no máximo" },
        { field: "objetivo_90_dias",   type: "textarea", label: "Qual é o seu objetivo nos próximos 90 dias?",                           placeholder: "Ex: aumentar ticket médio para R$5.000, conseguir 2 clientes recorrentes" },
      ],
    ],
  },
};

// fallback para tipo não mapeado
const DEFAULT_SET = SETS.consultivo;

// ─── Estilos ─────────────────────────────────────────────────────────────────

const inputCls = "w-full bg-white/5 border border-white/10 text-white placeholder-white/25 px-4 py-3 rounded-sm focus:outline-none focus:border-[hsl(42_100%_55%)] text-sm";
const taCls = `${inputCls} min-h-[90px] resize-none`;
const errorCls = "text-[hsl(42_100%_55%)] text-xs mt-1";
const labelCls = "block text-white/80 text-sm mb-2";

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

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  defaultValues: Partial<DiagData>;
  tipo_negocio?: string;
  onNext: (data: DiagData) => void;
  onBack: () => void;
}

const SUB_STEPS = 4;

export function StepDiagnostico({ defaultValues, tipo_negocio, onNext, onBack }: Props) {
  const [sub, setSub] = useState(0);

  const set = (tipo_negocio && SETS[tipo_negocio]) ? SETS[tipo_negocio] : DEFAULT_SET;
  const currentQuestions = set.subs[sub];
  const currentFields = currentQuestions.map(q => q.field);

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
    const valid = await trigger(currentFields);
    if (!valid) return;
    if (sub < SUB_STEPS - 1) setSub(sub + 1);
    else handleSubmit(onNext)();
  }

  function renderQuestion(q: Question) {
    const error = errors[q.field];
    return (
      <div key={q.field}>
        <label className={labelCls}>{q.label}</label>
        {q.type === "textarea" ? (
          <textarea {...register(q.field)} placeholder={q.placeholder} className={taCls} />
        ) : q.type === "radio" && q.options ? (
          <div className="flex flex-col gap-2 mt-1">
            {q.options.map(o => (
              <RadioCard key={o} label={o} selected={watched[q.field] === o} onChange={() => setValue(q.field, o, { shouldValidate: true })} />
            ))}
          </div>
        ) : (
          <input {...register(q.field)} placeholder={q.placeholder} className={inputCls} />
        )}
        {error && <p className={errorCls}>{error.message as string}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[hsl(42_100%_55%)] mb-6">
        {set.subTitles[sub]} — parte {sub + 1} de {SUB_STEPS}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${tipo_negocio}-${sub}`}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="space-y-5"
        >
          {currentQuestions.map(q => renderQuestion(q))}
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
