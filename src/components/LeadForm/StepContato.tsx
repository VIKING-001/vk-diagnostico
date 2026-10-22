import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { WHATSAPP_LINK } from "./shared";

const schema = z.object({
  nome: z.string().min(3, "Informe seu nome completo"),
  whatsapp: z.string().min(14, "Informe um WhatsApp válido"),
  email: z.string().email("Informe um e-mail válido").or(z.literal("")),
  empresa: z.string(),
  instagram: z.string(),
});

type ContatoData = z.infer<typeof schema>;

const inputCls = "w-full bg-white/5 border border-white/10 text-white placeholder-white/25 px-4 py-3 rounded-sm focus:outline-none focus:border-[hsl(42_100%_55%)] text-base sm:text-sm";
const errorCls = "text-[hsl(42_100%_55%)] text-xs mt-1";
const labelCls = "block text-white/80 text-sm mb-2";

function maskPhone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

interface Props {
  defaultValues: Partial<ContatoData>;
  onNext: (data: ContatoData) => void;
  onBack: () => void;
  submitError: string;
}

export function StepContato({ defaultValues, onNext, onBack, submitError }: Props) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ContatoData>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "", whatsapp: "", email: "", empresa: "", instagram: "", ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-nome" className={labelCls}>Nome completo *</label>
          <input id="lead-nome" {...register("nome")} placeholder="Seu nome completo" autoComplete="name" className={inputCls} />
          {errors.nome && <p className={errorCls}>{errors.nome.message}</p>}
        </div>

        <div>
          <label htmlFor="lead-whatsapp" className={labelCls}>WhatsApp *</label>
          <input
            id="lead-whatsapp"
            {...register("whatsapp")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(00) 00000-0000"
            className={inputCls}
            onChange={e => setValue("whatsapp", maskPhone(e.target.value), { shouldValidate: true })}
          />
          {errors.whatsapp && <p className={errorCls}>{errors.whatsapp.message}</p>}
        </div>

        <div>
          <label htmlFor="lead-email" className={labelCls}>E-mail <span className="text-white/45">(opcional)</span></label>
          <input id="lead-email" {...register("email")} type="email" autoComplete="email" placeholder="voce@empresa.com" className={inputCls} />
          {errors.email && <p className={errorCls}>{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="lead-empresa" className={labelCls}>Empresa <span className="text-white/45">(opcional)</span></label>
          <input id="lead-empresa" {...register("empresa")} autoComplete="organization" placeholder="Nome da empresa" className={inputCls} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="lead-instagram" className={labelCls}>Site ou Instagram <span className="text-white/45">(opcional)</span></label>
          <input id="lead-instagram" {...register("instagram")} placeholder="site.com.br ou @suaempresa" className={inputCls} />
        </div>
      </div>

      {submitError && <p role="alert" className="text-sm text-red-300 leading-relaxed">{submitError} <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Fale com a equipe pelo WhatsApp.</a></p>}
      <p className="text-xs text-white/45">Nossa equipe retorna pelo WhatsApp em até 1 dia útil para combinar os próximos passos.</p>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="flex-1 border border-white/15 text-white/50 font-bold text-xs tracking-widest uppercase py-4 rounded-sm hover:border-white/30 hover:text-white/70 transition-colors duration-200">← Voltar</button>
        <button type="submit" className="flex-[2] bg-[hsl(42_100%_55%)] text-[hsl(222_47%_5%)] font-bold text-sm tracking-widest uppercase py-4 rounded-sm hover:opacity-90 transition-opacity duration-200">Solicitar meu diagnóstico →</button>
      </div>
    </form>
  );
}
