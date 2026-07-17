// Opção clicável grande, ideal mobile (sem scroll horizontal, fácil de tocar)
export function Option({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-4 border text-left transition-all duration-150 active:scale-[0.99] overflow-visible ${
        selected
          ? "border-[hsl(42_100%_55%)] bg-[hsl(42_100%_55%/0.12)] text-white"
          : "border-white/10 text-white hover:border-white/30"
      }`}
    >
      <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-[2px] transition-all ${
        selected ? "border-[hsl(42_100%_55%)] bg-[hsl(42_100%_55%)]" : "border-white/40"
      }`} />
      <span className="flex-1 min-w-0 text-[15px] sm:text-sm leading-snug break-words">{label}</span>
    </button>
  );
}
