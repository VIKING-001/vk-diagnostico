import { motion } from "framer-motion";

interface Props { nome: string; whatsapp: string; }

export function StepSucesso({ nome, whatsapp }: Props) {
  const primeiro = nome.split(" ")[0];
  const waLink = `https://wa.me/5562992818038?text=${encodeURIComponent(`Oi! Acabei de preencher o diagnóstico. Sou ${nome}.`)}`;

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
        <p className="text-sm text-white/55 leading-relaxed">Se quiser acelerar, pode mandar uma mensagem agora. Mas sem pressão — a gente fala em breve de qualquer forma.</p>
      </div>
      <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-[hsl(42_100%_55%)] text-[hsl(222_47%_5%)] font-bold text-sm tracking-widest uppercase px-8 py-4 rounded-sm hover:opacity-90 transition-opacity duration-200">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.616l4.573-1.462A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.37 0-4.567-.734-6.388-1.988l-.364-.253-3.014.963.998-2.965-.277-.384A9.943 9.943 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
        Mandar mensagem agora
      </a>
    </motion.div>
  );
}
