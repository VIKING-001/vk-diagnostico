import { LeadForm } from "./components/LeadForm";

function App() {
  return (
    <div className="min-h-screen bg-[hsl(222_47%_2%)] text-white">
      {/* Minimal header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <span className="font-display text-2xl text-[hsl(42_100%_55%)] tracking-wider">
          VK COMPANY
        </span>
        <a
          href="https://vkcompany.com.br"
          className="text-[0.68rem] tracking-[0.18em] uppercase text-white/30 hover:text-white/60 transition-colors duration-200"
        >
          ← Voltar ao site
        </a>
      </header>

      <main className="px-6 py-12 md:py-16">
        <LeadForm />
      </main>
    </div>
  );
}

export default App;
