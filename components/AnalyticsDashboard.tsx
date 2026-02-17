"use client";

import type { Country, Category } from "@/data/countries";
import { getSimilarities } from "@/lib/similarities";
import CountryFlag from "./CountryFlag";
import InfoTooltip from "./InfoTooltip";

const formatTag = (tag: string): string => {
  const map: Record<string, string> = {
    subastas: "Subastas de espectro",
    omv: "Operadores Móviles Virtuales (OMV)",
    servicio_universal: "Obligaciones de servicio universal",
    infraestructura_pasiva: "Infraestructura pasiva",
    infraestructura_activa: "Infraestructura activa",
    comparticion_espectro: "Compartición del espectro",
    servicios_mayoristas: "Servicios mayoristas",
    proteccion_consumidor: "Protección de usuarios/consumidores",
    proteccion_datos: "Protección de datos",
    regulacion_ex_ante: "Regulación ex ante",
    posicion_dominante: "Posición dominante",
    alertas_emergencia: "Alertas de emergencia",
    difusion_celular: "Difusión celular",
    alfabetizacion_digital: "Alfabetización digital",
    reglamento_clientes: "Reglamento de clientes TIC",
    plan_nacional_frecuencias: "Plan Nacional de Frecuencias",
    cabfra: "CABFRA",
    sandbox: "Sandbox regulatorio",
    tecnologias_digitales: "Tecnologías digitales",
    "5g": "Redes 5G",
    iot: "IoT",
    imt: "IMT",
  };
  if (map[tag as keyof typeof map]) return map[tag as keyof typeof map];
  return tag.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const getShortSummary = (text: string, maxLength = 140): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
};

const CATEGORY_LABELS: Record<string, string> = {
  "Espectro radioeléctrico": "Gestión de Frecuencias",
  "Competencia Económica": "Competencia de Mercado",
  "Ciberseguridad": "Seguridad Digital",
  "Protección del usuario": "Derechos del Consumidor",
  "Tecnologías emergentes": "Innovación Tecnológica",
  "Compartición de la infraestructura": "Infraestructura Compartida",
  "Telecomunicaciones de emergencia": "Comunicaciones de Emergencia",
  "Homologación de productos y dispositivos": "Certificación de Equipos",
};

const METHOD_NOTE =
  "0-30%: baja similitud (enfoques distintos). 30-60%: convergencia media. >60%: alta alineación de marcos normativos.";

interface AnalyticsDashboardProps {
  countryA: Country | null;
  countryB: Country | null;
  allCountries: Country[];
}

export default function AnalyticsDashboard({
  countryA,
  countryB,
}: AnalyticsDashboardProps) {
  if (!countryA || !countryB) return null;

  const categoryList = [
    "Espectro radioeléctrico",
    "Competencia Económica",
    "Ciberseguridad",
    "Protección del usuario",
    "Tecnologías emergentes",
    "Compartición de la infraestructura",
    "Telecomunicaciones de emergencia",
    "Homologación de productos y dispositivos",
  ] as const;

  const categoryScores = categoryList
    .map((category) => {
      const practiceA = countryA.practices[category];
      const practiceB = countryB.practices[category];
      if (!practiceA || !practiceB) return null;
      const similarities = getSimilarities(practiceA, practiceB);
      const totalTags = practiceA.tags.length + practiceB.tags.length;
      const commonTags = similarities.common.length;
      const similarityScore = totalTags > 0 ? (commonTags / totalTags) * 100 : 0;
      return {
        category,
        similarityScore: Math.round(similarityScore),
        commonTags,
        commonTagIds: similarities.common as string[],
        totalTagsA: practiceA.tags.length,
        totalTagsB: practiceB.tags.length,
      };
    })
    .filter(Boolean);

  const avgSimilarity =
    categoryScores.length > 0
      ? Math.round(
          categoryScores.reduce((sum, c) => sum + (c?.similarityScore ?? 0), 0) /
            categoryScores.length
        )
      : 0;

  const totalCommon = categoryScores.reduce(
    (sum, c) => sum + (c?.commonTags ?? 0),
    0
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5 md:px-8">
        <h3 className="text-lg font-bold text-slate-900">
          Análisis comparativo
        </h3>
        <p className="mt-0.5 text-sm text-slate-500">
          {countryA.name} vs {countryB.name}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 border-b border-slate-100 px-6 py-5 md:px-8">
        <div className="text-center">
          <InfoTooltip hideFooter content={<p>{METHOD_NOTE}</p>}>
            <span className="cursor-help text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
              Similitud
            </span>
          </InfoTooltip>
          <p className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
            {avgSimilarity}%
          </p>
        </div>
        <div className="text-center">
          <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
            Sectores
          </span>
          <p className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
            {categoryScores.length}
            <span className="text-base font-semibold text-slate-500">/8</span>
          </p>
        </div>
        <div className="text-center">
          <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
            Prácticas comunes
          </span>
          <p className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
            {totalCommon}
          </p>
        </div>
      </div>

      <div className="px-6 py-4 md:px-8 md:py-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Similitud por sector
          </span>
          <InfoTooltip hideFooter content={<p>{METHOD_NOTE}</p>}>
            <span className="cursor-help text-slate-400">ⓘ</span>
          </InfoTooltip>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4">
          {categoryScores.map((score) => {
            if (!score) return null;
            const displayName = CATEGORY_LABELS[score.category] ?? score.category;
            const categoryKey = score.category as Category;
            const practiceA = countryA.practices[categoryKey];
            const practiceB = countryB.practices[categoryKey];

            const tooltipContent =
              score.commonTags === 0 ? (
                <p className="text-xs">Sin coincidencias en esta categoría.</p>
              ) : (
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-slate-900">
                    {score.commonTags} coincidencias · {score.totalTagsA + score.totalTagsB} elementos
                  </p>
                  <ul className="list-disc list-inside text-slate-700">
                    {score.commonTagIds.map((tagId: string) => (
                      <li key={tagId}>{formatTag(tagId)}</li>
                    ))}
                  </ul>
                  {practiceA?.summary && (
                    <p className="mt-1 border-t border-slate-200 pt-1 text-slate-600">
                      <span className="font-medium">{countryA.name}:</span>{" "}
                      {getShortSummary(practiceA.summary)}
                    </p>
                  )}
                  {practiceB?.summary && (
                    <p className="text-slate-600">
                      <span className="font-medium">{countryB.name}:</span>{" "}
                      {getShortSummary(practiceB.summary)}
                    </p>
                  )}
                </div>
              );

            return (
              <InfoTooltip key={score.category} hideFooter content={tooltipContent}>
                <div className="flex min-h-[100px] cursor-help flex-col justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-sky-200 hover:shadow-md">
                  <span className="line-clamp-2 text-sm font-medium leading-snug text-slate-800">
                    {displayName}
                  </span>
                  <div className="mt-3">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Similitud</span>
                      <span className="text-sm font-semibold text-slate-700">
                        {score.similarityScore}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-sky-500 transition-all duration-300"
                        style={{
                          width: `${Math.max(score.similarityScore, 2)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </InfoTooltip>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-3 md:px-8">
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1.5">
            <CountryFlag flag={countryA.flag} size="sm" />
            <strong className="text-slate-800">{countryA.name}</strong>
            <span className="text-slate-400">
              {categoryList.reduce(
                (sum, cat) =>
                  sum + (countryA.practices[cat]?.tags.length ?? 0),
                0
              )}{" "}
              prácticas
            </span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1.5">
            <CountryFlag flag={countryB.flag} size="sm" />
            <strong className="text-slate-800">{countryB.name}</strong>
            <span className="text-slate-400">
              {categoryList.reduce(
                (sum, cat) =>
                  sum + (countryB.practices[cat]?.tags.length ?? 0),
                0
              )}{" "}
              prácticas
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
