import { motion } from "framer-motion";
import { WHATSAPP_LINK } from "./shared";

interface Props { onBack: () => void; }

export function StepDescartado({ onBack }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center py-8 space-y-6 max-w-[480px] mx-auto">
      <div>
        <p className="text-[0.6rem] tracking-widest uppercase text-white/30 mb-4">Uma resposta honesta</p>
        <h2 className="font-display text-4xl leading-tight mb-4">Talvez não seja<br />o momento certo.</h2>
        <p className="text-sm text-white/50 leading-relaxed">
          Pelas respostas, talvez uma operação de marketing ainda não seja prioridade agora. Quando houver uma verba mensal para anúncios e um prazo para começar, fica mais fácil avaliar o caminho com clareza.
        </p>
      </div>
      <div className="border border-white/8 bg-white/3 p-5 text-left space-y-2">
        <p className="text-[0.65rem] tracking-widest uppercase text-white/30">O que fazer agora</p>
        <p className="text-sm text-white/55 leading-relaxed">Se quiser conversar com a equipe mesmo assim, estamos por aqui. Quando o momento mudar, você também pode voltar e pedir uma nova análise.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={onBack} className="border border-white/15 text-white/50 font-bold text-xs tracking-widest uppercase px-8 py-4 rounded-sm hover:border-white/30 hover:text-white/70 transition-colors duration-200">← Rever minhas respostas</button>
        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="bg-white/8 text-white/60 font-bold text-xs tracking-widest uppercase px-8 py-4 rounded-sm hover:bg-white/12 transition-colors duration-200">Falar assim mesmo</a>
      </div>
    </motion.div>
  );
}
