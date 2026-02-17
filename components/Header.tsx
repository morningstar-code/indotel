"use client";

export default function Header() {
  const today = new Date().toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 hidden h-11 w-1 rounded-full bg-gradient-to-b from-sky-500 to-cyan-400 sm:block" />
          <div className="flex flex-col">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-sky-700">
              Observatorio regional
            </span>
            <div className="text-xl font-extrabold tracking-tight text-slate-900 md:text-[1.7rem]">
              Mejores Prácticas Regulatorias
            </div>
            <div className="mt-1 text-xs text-slate-600 md:text-[0.82rem]">
              Plataforma de análisis comparativo para la Presidencia de INDOTEL
            </div>
            <div className="mt-2 hidden items-center gap-3 text-[0.68rem] text-slate-500 md:flex">
              <span className="rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 font-semibold text-sky-700">
                REGULATEL
              </span>
              <span>República Dominicana · INDOTEL</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs sm:flex-row sm:items-center sm:gap-3 sm:text-sm">
            <span className="text-[0.6rem] uppercase tracking-[0.18em] text-slate-500">
              Fecha de consulta
            </span>
            <span className="font-medium text-slate-700">{today}</span>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center rounded-xl border border-sky-700 bg-sky-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-sky-800 sm:text-sm"
          >
            <span className="mr-2">📝</span>
            Generar informe
          </button>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
              }
            }}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:text-sm"
          >
            Ir a IA
          </button>
        </div>
      </div>
    </header>
  );
}


