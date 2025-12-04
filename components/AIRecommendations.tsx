"use client";

import { useState } from "react";
import type { Country, Category } from "@/data/countries";

const formatRecommendations = (text: string): string[] => {
  // Divide el texto en bloques separados por líneas en blanco dobles
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
};

interface AIRecommendationsProps {
  countryA: Country | null;
  countryB: Country | null;
  category: Category;
}

export default function AIRecommendations({
  countryA,
  countryB,
  category,
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedBlocks = recommendations ? formatRecommendations(recommendations) : [];

  const generateRecommendations = async () => {
    if (!countryA || !countryB) {
      setError("Por favor selecciona dos países para comparar");
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const practiceA = countryA.practices[category];
      const practiceB = countryB.practices[category];

      if (!practiceA || !practiceB) {
        setError("No hay información disponible para esta categoría");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          countryA: countryA.name,
          countryB: countryB.name,
          category,
          practiceA: {
            summary: practiceA.summary,
            details: practiceA.details,
          },
          practiceB: {
            summary: practiceB.summary,
            details: practiceB.details,
          },
        }),
      });

      if (!response.ok) {
        let backendError = "Error al generar recomendaciones";
        try {
          const errData = await response.json();
          if (errData?.error) {
            backendError = `Error al generar recomendaciones: ${errData.error}`;
          }
        } catch {
          // ignore JSON parse errors, keep generic message
        }
        throw new Error(backendError);
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al generar recomendaciones. Asegúrate de tener configurada la API key del servicio de IA (Anthropic/Claude)."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center">
        <span className="mr-2">🤖</span>
        Recomendaciones para la Presidencia de INDOTEL (IA)
      </h3>
      <p className="text-[0.7rem] text-slate-600 mb-4">
        Borrador generado automáticamente a partir de las prácticas comparadas. Debe ser validado por los equipos técnicos antes de su adopción.
      </p>

      {!countryA || !countryB ? (
        <p className="text-slate-600 text-sm">
          Selecciona dos países para generar recomendaciones específicas.
        </p>
      ) : (
        <>
          <button
            onClick={generateRecommendations}
            disabled={loading}
            className={`
              w-full px-4 py-3 rounded-lg font-semibold transition-all
              ${
                loading
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-sky-600 text-white hover:bg-sky-700 shadow-sm"
              }
            `}
          >
            {loading ? "Generando nota recomendatoria..." : "Generar nota recomendatoria"}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-300 rounded-lg">
              <p className="text-amber-800 text-sm">{error}</p>
            </div>
          )}

          {recommendations && (
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="max-h-96 overflow-y-auto px-4 py-3 space-y-2">
                {formattedBlocks.map((block, idx) => {
                  const isHeading =
                    idx === 0 || /^\s*\d+\./.test(block) || block.length < 90;

                  return (
                    <p
                      key={idx}
                      className={
                        "text-[0.74rem] leading-relaxed " +
                        (isHeading
                          ? "font-semibold text-slate-900 mt-1"
                          : "text-slate-700")
                      }
                    >
                      {block}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}


