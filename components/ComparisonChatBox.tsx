"use client";

import type { Country, Category } from "@/data/countries";
import InlineChat from "./InlineChat";

interface ComparisonChatBoxProps {
  countryA: Country | null;
  countryB: Country | null;
  category: Category;
}

export default function ComparisonChatBox({
  countryA,
  countryB,
  category,
}: ComparisonChatBoxProps) {
  const hasCountries = !!countryA && !!countryB;

  const initialQuestion = hasCountries
    ? `Explícame brevemente las similitudes y diferencias regulatorias clave entre ${countryA!.name} y ${countryB!.name} en la categoría "${category}".`
    : "Escribe aquí tu pregunta sobre la comparación regulatoria o las mejores prácticas en telecomunicaciones.";

  const context = hasCountries
    ? `Contexto: estás analizando prácticas regulatorias entre ${countryA!.name} (País A) y ${countryB!.name} (País B) dentro del Observatorio de Mejores Prácticas Regulatorias de REGULATEL. La categoría actualmente seleccionada es: "${category}". Responde siempre en español y enfoca las respuestas en: (i) similitudes y diferencias entre ambos países, (ii) fortalezas y brechas de cada uno, y (iii) posibles lecciones útiles para INDOTEL.`
    : `Contexto general: estás asistiendo a INDOTEL en el análisis comparado de marcos regulatorios de telecomunicaciones en América Latina usando el portal de mejores prácticas de REGULATEL. No hay dos países seleccionados simultáneamente, responde en español de forma breve y orientada a toma de decisiones.`;

  return (
    <div className="mt-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
      <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center">
        <span className="mr-2">💬</span>
        Chat comparativo (IA)
      </h3>
      <p className="text-[0.7rem] text-slate-600 mb-2">
        Formula preguntas abiertas sobre las similitudes, diferencias o detalles adicionales del marco regulatorio de los países seleccionados.
      </p>
      <InlineChat initialQuestion={initialQuestion} context={context} />
    </div>
  );
}
