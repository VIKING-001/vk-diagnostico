import { motion } from "framer-motion";

interface Props { nome: string; whatsapp: string; }

export function StepSucesso({ nome, whatsapp }: Props) {
  const primeiro = nome.split(" ")[0];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center py-8 space-y-6 max-w-[480px] mx-auto">
      <div className="w-16 h-16 rounded-full bg-[hsl(42_100%_55%/0.1)] border border-[hsl(42_100%_55%/0.3)] flex items-center justify-center mx-auto">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="hsl(42 100% 55%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div>
        <h2 className="font-display text-4xl mb-3">Recebemos, {primeiro}.</h2>
        <p className="text-sm text-white/50 leading-relaxed">
          Vamos analisar tudo com cuidado. Se fizer sentido trabalhar juntos, a gente entra em contato pelo WhatsApp <strong className="text-white/70">{whatsapp}</strong> em até 24 horas úteis.
        </p>
      </div>
      <div className="border border-white/8 bg-white/3 p-5 text-left">
        <p className="text-[0.65rem] tracking-widest uppercase text-white/30 mb-2">Próximo passo</p>
        <p className="text-sm text-white/55 leading-relaxed">Nossa equipe vai analisar suas respostas e entrar em contato em breve. Não precisa fazer mais nada por enquanto.</p>
      </div>
    </motion.div>
  );
}
