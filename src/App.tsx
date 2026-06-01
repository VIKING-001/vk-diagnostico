import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LeadForm } from "./components/LeadForm";
import { AdminPage } from "./pages/AdminPage";

// Partícula flutuante decorativa
function FloatingOrb({ className }: { className: string }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      animate={{ y: [0, -24, 0], scale: [1, 1.08, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function FormLayout() {
  const headerRef = useRef<HTMLDivElement>(null);

  // Linha brilhante que acompanha o scroll
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const onScroll = () => {
      el.style.borderBottomColor = window.scrollY > 10 ? "rgba(255,255,255,0.08)" : "transparent";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(222_47%_2%)] text-white relative overflow-x-hidden">

      {/* ── Orbs de fundo ── */}
      <FloatingOrb className="w-[500px] h-[500px] bg-[hsl(42_100%_55%/0.04)] -top-40 -left-40" />
      <FloatingOrb className="w-[400px] h-[400px] bg-[hsl(42_100%_55%/0.03)] top-1/2 -right-32" />
      <FloatingOrb className="w-[300px] h-[300px] bg-[hsl(220_80%_60%/0.03)] bottom-20 left-1/4" />

      {/* ── Noise/grain overlay sutil ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "128px" }}
      />

      {/* ── Header ── */}
      <motion.header
        ref={headerRef as any}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 border-b border-transparent px-6 py-4 flex items-center justify-between transition-colors duration-300"
      >
        {/* Logo com glow */}
        <div className="relative">
          <span className="font-display text-2xl tracking-wider relative z-10" style={{
            background: "linear-gradient(135deg, #fff 40%, hsl(42,100%,55%) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            VK COMPANY
          </span>
          <span className="absolute -inset-2 rounded-lg blur-xl bg-[hsl(42_100%_55%/0.12)] pointer-events-none" />
        </div>

        <motion.a
          href="https://vkcompany.com.br"
          whileHover={{ x: -3 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="text-[0.68rem] tracking-[0.18em] uppercase text-white/40 hover:text-white/70 transition-colors duration-200"
        >
          ← Voltar ao site
        </motion.a>
      </motion.header>

      {/* ── Conteúdo ── */}
      <main className="relative z-10 px-6 py-12 md:py-16">
        <LeadForm />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FormLayout />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
