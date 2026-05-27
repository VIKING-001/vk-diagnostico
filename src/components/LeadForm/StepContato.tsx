import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  nome:      z.string().min(3, "Informe seu nome completo"),
  whatsapp:  z.string().min(14, "Informe um WhatsApp válido"),
  email:     z.string().email("Informe um e-mail válido"),
  empresa:   z.string().min(2, "Informe o nome do negócio"),
  instagram: z.string().optional(),
  cargo:     z.string().min(1, "Selecione seu cargo"),
});

type ContatoData = z.infer<typeof schema>;

const inputCls = "w-full bg-white/5 border border-white/10 text-white placeholder-white/25 px-4 py-3 rounded-sm focus:outline-none focus:border-[hsl(42_100%_55%)] text-sm";
const errorCls = "text-[hsl(42_100%_55%)] text-xs mt-1";
const labelCls = "block text-white/80 text-sm mb-2";

function maskPhone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

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
  defaultValues: Partial<ContatoData>;
  onNext: (data: ContatoData) => void;
  onBack: () => void;
}

export function StepContato({ defaultValues, onNext, onBack }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ContatoData>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "", whatsapp: "", email: "", empresa: "", instagram: "", cargo: "", ...defaultValues },
  });

  const watched = watch();

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">

      <div>
        <label className={labelCls}>Nome completo</label>
        <input {...register("nome")} placeholder="Rodrigo Cabral" className={inputCls} />
        {errors.nome && <p className={errorCls}>{errors.nome.message}</p>}
      </div>

      <div>
        <label className={labelCls}>WhatsApp</label>
        <input
          {...register("whatsapp")}
          placeholder="(62) 99999-9999"
          className={inputCls}
          onChange={(e) => setValue("whatsapp", maskPhone(e.target.value), { shouldValidate: true })}
        />
        {errors.whatsapp && <p className={errorCls}>{errors.whatsapp.message}</p>}
      </div>

      <div>
        <label className={labelCls}>E-mail</label>
        <input {...register("email")} type="email" placeholder="voce@empresa.com" className={inputCls} />
        {errors.email && <p className={errorCls}>{errors.email.message}</p>}
      </div>

      <div>
        <label className={labelCls}>Empresa / Nome do negócio</label>
        <input {...register("empresa")} placeholder="Ex: Clínica Estética X" className={inputCls} />
        {errors.empresa && <p className={errorCls}>{errors.empresa.message}</p>}
      </div>

      <div>
        <label className={labelCls}>Instagram da empresa <span className="text-white/55">(opcional)</span></label>
        <p className="text-white/55 text-xs mb-2">Se ainda não tem, deixa em branco.</p>
        <input {...register("instagram")} placeholder="@suaempresa" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Qual é o seu cargo?</label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {["Proprietário / Sócio", "Diretor / CEO", "Gerente / Coordenador", "Outro"].map(o => (
            <RadioCard key={o} label={o} selected={watched.cargo === o} onChange={() => setValue("cargo", o, { shouldValidate: true })} />
          ))}
        </div>
        {errors.cargo && <p className={errorCls}>{errors.cargo.message}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="flex-1 border border-white/15 text-white/50 font-bold text-xs tracking-widest uppercase py-4 rounded-sm hover:border-white/30 hover:text-white/70 transition-colors duration-200">← Voltar</button>
        <button type="submit" className="flex-[2] bg-[hsl(42_100%_55%)] text-[hsl(222_47%_5%)] font-bold text-sm tracking-widest uppercase py-4 rounded-sm hover:opacity-90 transition-opacity duration-200">Continuar →</button>
      </div>
    </form>
  );
}
