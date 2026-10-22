import { motion } from "framer-motion";

interface Props {
  nome: string;
  whatsapp: string;
  desafio: string;
  faturamento: string;
  investimento: string;
  prazo: string;
}

export function StepSucesso({ nome, whatsapp, desafio, faturamento, investimento, prazo }: Props) {
  const primeiro = nome.trim().split(/\s+/)[0] || "";
  const respostas = [
    ["Principal desafio", desafio],
    ["Faturamento mensal", faturamento],
    ["Verba mensal para anúncios", investimento],
    ["Prazo para começar", prazo],
  ];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="py-6 space-y-6 max-w-[520px] mx-auto">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[hsl(42_100%_55%/0.1)] border border-[hsl(42_100%_55%/0.3)] flex items-center justify-center mx-auto">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="hsl(42 100% 55%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <h2 className="font-display text-3xl sm:text-4xl mb-3">Solicitação recebida{primeiro ? `, ${primeiro}` : ""}.</h2>
          <p className="text-sm text-white/55 leading-relaxed">
            Nossa equipe vai revisar suas respostas e falar com você pelo WhatsApp <strong className="text-white/80">{whatsapp}</strong> em até 1 dia útil para entender melhor o cenário e combinar os próximos passos.
          </p>
        </div>
      </div>

      <div className="border border-white/8 bg-white/3 p-5">
        <p className="text-[0.65rem] tracking-widest uppercase text-white/35 mb-4">Resumo do que você informou</p>
        <dl className="grid gap-4 sm:grid-cols-2">
          {respostas.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-white/35 mb-1">{label}</dt>
              <dd className="text-sm text-white/80 leading-relaxed">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="border border-white/8 bg-white/3 p-5 text-left">
        <p className="text-[0.65rem] tracking-widest uppercase text-white/35 mb-2">Próximo passo</p>
        <p className="text-sm text-white/55 leading-relaxed">Vamos preparar a conversa com base nas informações que você compartilhou. Não precisa fazer mais nada por enquanto.</p>
      </div>
    </motion.div>
  );
}
