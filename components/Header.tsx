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
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                Observatorio Regional
              </span>
              <div className="text-2xl md:text-[1.55rem] font-extrabold text-slate-900 tracking-tight">
                Observatorio de Mejores Prácticas Regulatorias
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Herramienta de apoyo a la toma de decisiones para la Presidencia de INDOTEL
              </div>
            </div>
            <div className="hidden md:flex flex-col items-start pl-4 ml-4 border-l border-slate-200">
              <span className="text-[0.68rem] font-semibold tracking-[0.22em] text-slate-500 uppercase">
                Organismos
              </span>
              <span className="text-sm font-semibold text-sky-800">REGULATEL</span>
              <span className="text-xs text-slate-600">República Dominicana · INDOTEL</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="text-xs sm:text-sm text-slate-700 font-medium bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <span className="uppercase tracking-[0.18em] text-[0.6rem] text-slate-500">
                Fecha de consulta
              </span>
              <span>{today}</span>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-sky-700 bg-sky-700 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-sky-800 transition-colors"
            >
              <span className="mr-2">📝</span>
              Generar informe (vista para impresión)
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}


