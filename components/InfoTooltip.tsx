"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";

interface InfoTooltipProps {
  content: ReactNode;
  children: ReactNode;
  hideFooter?: boolean;
}

export default function InfoTooltip({ content, children, hideFooter = false }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);

  // Cerrar al hacer clic fuera del tooltip
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const node = containerRef.current;
      if (!node) return;
      if (!node.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  const handleAskAI = () => {
    if (typeof window === "undefined") return;
    const panel = document.getElementById("ai-panel");
    if (panel) {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <span
      ref={containerRef}
      className="relative inline-flex cursor-pointer"
      tabIndex={0}
      onClick={() => setOpen((prev) => !prev)}
      onKeyDown={(e) => {
        // Siempre permitir que Escape cierre el tooltip, incluso desde elementos internos
        if (e.key === "Escape") {
          e.preventDefault();
          setOpen(false);
          return;
        }

        // Solo togglear con Enter/Espacio cuando el foco está en el contenedor
        if (e.target !== e.currentTarget) return;

        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen((prev) => !prev);
        }
      }}
    >
      {children}
      {open && (
        <div
          className="absolute z-50 top-0 right-full mr-3 w-[360px] max-w-sm rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-800 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">{content}</div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-[0.6rem] text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Cerrar tooltip"
              >
                ×
              </button>
            </div>
            {!hideFooter && (
              <div className="pt-2 mt-1 border-t border-slate-200 text-[0.68rem] text-slate-600">
                <p className="mb-1">
                  Para profundizar, puede solicitar una nota detallada a la IA usando el módulo
                  <span className="font-semibold text-slate-900"> &quot;Recomendaciones para la Presidencia de INDOTEL&quot;</span>
                  en la columna derecha.
                </p>
                <button
                  type="button"
                  onClick={handleAskAI}
                  className="mt-1 inline-flex items-center rounded-md border border-sky-600 bg-sky-50 px-2 py-1 text-[0.68rem] font-semibold text-sky-800 hover:bg-sky-100"
                >
                  Ir al panel de IA
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </span>
  );
}
