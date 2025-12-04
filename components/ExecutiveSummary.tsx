"use client";

import type { Country, Category } from "@/data/countries";
import { categories } from "@/data/countries";
import { getSimilarities } from "@/lib/similarities";
import CountryFlag from "./CountryFlag";
import InfoTooltip from "./InfoTooltip";

interface ExecutiveSummaryProps {
  countryA: Country | null;
  countryB: Country | null;
}

export default function ExecutiveSummary({
  countryA,
  countryB,
}: ExecutiveSummaryProps) {
  if (!countryA || !countryB) {
    return null;
  }

  // Calcular métricas clave
  const allSimilarities = categories.map((category) => {
    const practiceA = countryA.practices[category];
    const practiceB = countryB.practices[category];
    if (!practiceA || !practiceB) return null;
    return getSimilarities(practiceA, practiceB);
  }).filter(Boolean);

  const totalCommon = allSimilarities.reduce((sum, s) => sum + (s?.common.length || 0), 0);
  const totalOnlyA = allSimilarities.reduce((sum, s) => sum + (s?.onlyA.length || 0), 0);
  const totalOnlyB = allSimilarities.reduce((sum, s) => sum + (s?.onlyB.length || 0), 0);

  // Identificar fortalezas y debilidades
  // En vez de exigir que A tenga más tags que B, priorizamos
  // las categorías donde cada país tiene más densidad de prácticas registradas.
  const strengthsA = categories
    .map((cat) => {
      const practiceA = countryA.practices[cat];
      if (!practiceA) return null;
      const score = practiceA.tags?.length || 0;
      if (score === 0) return null;
      return { cat, score };
    })
    .filter(Boolean)
    .sort((a, b) => (b!.score || 0) - (a!.score || 0))
    .slice(0, 3)
    .map((item) => item!.cat);

  const strengthsB = categories
    .map((cat) => {
      const practiceB = countryB.practices[cat];
      if (!practiceB) return null;
      const score = practiceB.tags?.length || 0;
      if (score === 0) return null;
      return { cat, score };
    })
    .filter(Boolean)
    .sort((a, b) => (b!.score || 0) - (a!.score || 0))
    .slice(0, 3)
    .map((item) => item!.cat);

  const totalUniverse = totalCommon + totalOnlyA + totalOnlyB;
  const convergence = totalUniverse > 0 ? Math.round((totalCommon / totalUniverse) * 100) : 0;

  const convergenceLabel =
    convergence >= 70 ? "Alto" : convergence >= 40 ? "Medio" : "Bajo";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-7 shadow-sm mb-6">
      {/* Encabezado tipo informe */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>Resumen Ejecutivo de la Comparación Bilateral</span>
          </h3>
          <p className="mt-1 text-xs md:text-sm text-slate-600 max-w-2xl">
            Síntesis de convergencia regulatoria entre <strong className="text-sky-800 font-semibold">{countryA.name}</strong> y <strong className="text-sky-800 font-semibold">{countryB.name}</strong>,
            con foco en oportunidades concretas para la toma de decisiones de INDOTEL.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <InfoTooltip
              content={
                <p>
                  Proporción de prácticas regulatorias que comparten ambos países sobre el total
                  identificado, como indicador sintético de cuán alineados están sus marcos normativos.
                </p>
              }
            >
              <div className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-400 mb-1 cursor-help">
                Nivel de convergencia global
              </div>
            </InfoTooltip>
            <div className="inline-flex items-baseline gap-2 px-3 py-2 rounded-lg bg-sky-50 border border-sky-200">
              <span className="text-3xl font-extrabold text-sky-900">{convergence}</span>
              <span className="text-sm font-semibold text-sky-700">%</span>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                {convergenceLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Perfiles breves de cada país */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* País A */}
        <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
          <div className="flex items-center mb-4 pb-3 border-b border-slate-200">
            <CountryFlag flag={countryA.flag} size="md" />
            <div className="ml-3">
              <h4 className="text-lg font-bold text-slate-900">{countryA.name}</h4>
              <p className="text-xs text-slate-500">País de referencia (A)</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-[0.18em] mb-1">
                Principales fortalezas
              </div>
              <div className="flex flex-wrap gap-2">
                {strengthsA.length > 0 ? (
                  strengthsA.map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[0.7rem] font-medium border border-emerald-200"
                    >
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-600">
                    Se registran prácticas en varias categorías; ver inventario y
                    elementos únicos.
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-700">
              Prácticas exclusivas de {countryA.name}: {" "}
              <span className="text-sky-800 font-bold">{totalOnlyA}</span>
            </div>
          </div>
        </div>

        {/* País B */}
        <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
          <div className="flex items-center mb-4 pb-3 border-b border-slate-200">
            <CountryFlag flag={countryB.flag} size="md" />
            <div className="ml-3">
              <h4 className="text-lg font-bold text-slate-900">{countryB.name}</h4>
              <p className="text-xs text-slate-500">País comparador (B)</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-[0.18em] mb-1">
                Principales fortalezas
              </div>
              <div className="flex flex-wrap gap-2">
                {strengthsB.length > 0 ? (
                  strengthsB.map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[0.7rem] font-medium border border-emerald-200"
                    >
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-600">
                    Se registran prácticas en varias categorías; ver inventario y
                    elementos únicos.
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-700">
              Prácticas exclusivas de {countryB.name}: {" "}
              <span className="text-indigo-800 font-bold">{totalOnlyB}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes clave para la Presidencia de INDOTEL */}
      <div className="bg-sky-50 rounded-lg p-5 border border-sky-200">
        <h4 className="text-xs font-bold text-sky-800 mb-3 uppercase tracking-[0.2em]">
          Recomendaciones estratégicas para la Presidencia de INDOTEL
        </h4>
        <ul className="space-y-2 text-xs md:text-sm text-slate-800">
          <li className="flex items-start">
            <span className="mr-2 text-sky-600">•</span>
            <span>
              <strong className="text-sky-900">Aprovechar las {totalCommon} prácticas comunes</strong> como base para agendas conjuntas,
              intercambio técnico y posicionamiento regional.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-emerald-600">•</span>
            <span>
              <strong className="text-emerald-900">Priorizar la adopción selectiva de prácticas de {countryB.name}</strong> ({totalOnlyB} identificadas),
              especialmente en aquellas categorías donde {countryB.name} muestra mayor desarrollo.
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-amber-500">•</span>
            <span>
              Focalizar el seguimiento de INDOTEL en las categorías con menor convergencia,
              donde aún no se han incorporado buenas prácticas y existe mayor espacio de mejora.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}


