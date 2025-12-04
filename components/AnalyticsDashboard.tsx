"use client";

import type { Country, Category } from "@/data/countries";
import { getSimilarities } from "@/lib/similarities";
import CountryFlag from "./CountryFlag";
import InfoTooltip from "./InfoTooltip";

// Formatear etiquetas técnicas (tags) a descripciones legibles
const formatTag = (tag: string): string => {
  const map: Record<string, string> = {
    // Casos frecuentes y más visibles en el dashboard
    subastas: "Subastas de espectro",
    omv: "Operadores Móviles Virtuales (OMV)",
    servicio_universal: "Obligaciones de servicio universal",
    infraestructura_pasiva: "Infraestructura pasiva (torres, ductos, sitios)",
    infraestructura_activa: "Infraestructura activa (redes, equipos)",
    comparticion_espectro: "Compartición del espectro radioeléctrico",
    servicios_mayoristas: "Servicios mayoristas de telecomunicaciones",
    proteccion_consumidor: "Protección de los usuarios/consumidores",
    proteccion_datos: "Protección de datos personales",
    regulacion_ex_ante: "Regulación ex ante para competencia",
    posicion_dominante: "Prevención de abuso de posición dominante",
    alertas_emergencia: "Sistema de alertas de emergencia",
    difusion_celular: "Difusión celular de mensajes de alerta",
    alfabetizacion_digital: "Programas de alfabetización y capacitación digital",
    reglamento_clientes: "Reglamento de derechos de clientes TIC",
    plan_nacional_frecuencias: "Plan Nacional de Frecuencias",
    cabfra: "Cuadro de atribución de bandas de frecuencias (CABFRA)",
    sandbox: "Sandbox regulatorio para nuevas tecnologías",
    tecnologias_digitales: "Nuevas tecnologías y servicios digitales",
    "5g": "Redes 5G",
    iot: "Internet de las Cosas (IoT)",
    imt: "Telecomunicaciones móviles internacionales (IMT)",
  };

  if (map[tag as keyof typeof map]) {
    return map[tag as keyof typeof map];
  }

  const cleaned = tag.replace(/_/g, " ");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

// Recortar resúmenes largos para tooltips anidados
const getShortSummary = (text: string, maxLength = 160): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  const sliced = text.slice(0, maxLength);
  // Evitar cortar a mitad de palabra
  return sliced.replace(/\s+\S*$/, "") + "…";
};

interface AnalyticsDashboardProps {
  countryA: Country | null;
  countryB: Country | null;
  allCountries: Country[];
}

export default function AnalyticsDashboard({
  countryA,
  countryB,
  allCountries,
}: AnalyticsDashboardProps) {
  if (!countryA || !countryB) {
    return null;
  }

  // Calcular métricas
  const categories = [
    "Espectro radioeléctrico",
    "Competencia Económica",
    "Ciberseguridad",
    "Protección del usuario",
    "Tecnologías emergentes",
    "Compartición de la infraestructura",
    "Telecomunicaciones de emergencia",
    "Homologación de productos y dispositivos",
  ] as const;

  const categoryScores = categories
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
        commonTags: similarities.common.length,
        commonTagIds: similarities.common as string[],
        totalTagsA: practiceA.tags.length,
        totalTagsB: practiceB.tags.length,
      };
    })
    .filter(Boolean);

  const avgSimilarity = categoryScores.length > 0
    ? Math.round(categoryScores.reduce((sum, c) => sum + (c?.similarityScore || 0), 0) / categoryScores.length)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
      {/* Header Gubernamental */}
      <div className="border-b border-slate-200 pb-4 mb-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight flex items-center">
          <svg className="w-7 h-7 mr-3 text-sky-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          Panel de Análisis Regulatorio Comparativo
        </h3>
        <p className="text-slate-600 text-sm font-medium">Evaluación de marcos normativos en telecomunicaciones</p>
      </div>
      
      {/* Scorecard Principal - Estilo Gubernamental */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-sky-50 rounded border border-sky-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <InfoTooltip
              content={
                <p>
                  Porcentaje promedio de coincidencia entre las prácticas regulatorias de
                  <strong className="text-blue-200"> {countryA.name} </strong>
                  y
                  <strong className="text-blue-200"> {countryB.name}</strong> en todos los sectores analizados.
                </p>
              }
            >
              <div className="text-xs uppercase tracking-wider text-sky-800 font-semibold cursor-help">
                Índice de Similitud
              </div>
            </InfoTooltip>
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-5xl font-extrabold text-sky-900 mb-2">{avgSimilarity}<span className="text-2xl text-sky-700">%</span></div>
          <div className="text-xs text-sky-800 font-medium">Convergencia regulatoria promedio</div>
        </div>
        
        <div className="bg-emerald-50 rounded border border-emerald-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <InfoTooltip
              content={
                <p>
                  Número de sectores regulatorios para los que existe información comparable entre
                  <strong className="text-emerald-200"> {countryA.name}</strong> y
                  <strong className="text-emerald-200"> {countryB.name}</strong>.
                </p>
              }
            >
              <div className="text-xs uppercase tracking-wider text-emerald-800 font-semibold cursor-help">
                Categorías
              </div>
            </InfoTooltip>
            <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
          </div>
          <div className="text-5xl font-extrabold text-emerald-900 mb-2">{categoryScores.length}<span className="text-2xl text-emerald-700">/8</span></div>
          <div className="text-xs text-emerald-800 font-medium">Sectores regulatorios evaluados</div>
        </div>
        
        <div className="bg-indigo-50 rounded border border-indigo-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <InfoTooltip
              content={
                <p>
                  Cantidad total de prácticas regulatorias que están presentes tanto en
                  <strong className="text-violet-200"> {countryA.name}</strong> como en
                  <strong className="text-violet-200"> {countryB.name}</strong>.
                </p>
              }
            >
              <div className="text-xs uppercase tracking-wider text-indigo-800 font-semibold cursor-help">
                Prácticas Comunes
              </div>
            </InfoTooltip>
            <svg className="w-5 h-5 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-5xl font-extrabold text-indigo-900 mb-2">
            {categoryScores.reduce((sum, c) => sum + (c?.commonTags || 0), 0)}
          </div>
          <div className="text-xs text-indigo-800 font-medium">Elementos regulatorios compartidos</div>
        </div>
      </div>

      {/* Gráfico de Similitud por Categoría */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-slate-800 mb-5 uppercase tracking-widest flex items-center border-b border-slate-200 pb-2">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Análisis por Sector Regulatorio
        </h4>
        <div className="space-y-4">
          {categoryScores.map((score) => {
            if (!score) return null;
            // Mapeo de nombres técnicos a nombres claros
            const categoryNames: Record<string, string> = {
              "Espectro radioeléctrico": "Gestión de Frecuencias",
              "Competencia Económica": "Competencia de Mercado",
              "Ciberseguridad": "Seguridad Digital",
              "Protección del usuario": "Derechos del Consumidor",
              "Tecnologías emergentes": "Innovación Tecnológica",
              "Compartición de la infraestructura": "Infraestructura Compartida",
              "Telecomunicaciones de emergencia": "Comunicaciones de Emergencia",
              "Homologación de productos y dispositivos": "Certificación de Equipos"
            };
            const displayName = categoryNames[score.category] || score.category;

            // Ubicar los resúmenes de la práctica de cada país para esta categoría
            const categoryKey = score.category as Category;
            const practiceA = countryA.practices[categoryKey];
            const practiceB = countryB.practices[categoryKey];
            
            return (
              <div key={score.category} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-800">{displayName}</span>
                  <span className="text-lg font-bold text-sky-800">{score.similarityScore}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${score.similarityScore}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <InfoTooltip
                    hideFooter
                    content={
                      score.commonTags === 0 ? (
                        <p>No se registran coincidencias específicas en esta categoría.</p>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-900 text-[0.7rem]">
                            Coincidencias en {displayName}:
                          </p>
                          <ul className="list-disc list-inside text-[0.7rem] text-slate-700 space-y-0.5">
                            {score.commonTagIds.map((tagId: string) => {
                              const label = formatTag(tagId);

                              const tooltipParts: string[] = [
                                `Coincidencia en ${displayName}: ${label}.`,
                              ];

                              if (practiceA?.summary) {
                                tooltipParts.push(
                                  `${countryA.name}: ${getShortSummary(practiceA.summary)}`
                                );
                              }

                              if (practiceB?.summary) {
                                tooltipParts.push(
                                  `${countryB.name}: ${getShortSummary(practiceB.summary)}`
                                );
                              }

                              const tooltipText = tooltipParts.join(" ");

                              return (
                                <li key={tagId} title={tooltipText}>
                                  {label}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )
                    }
                  >
                    <span className="underline decoration-dotted decoration-sky-300 cursor-help">
                      {score.commonTags} coincidencias
                    </span>
                  </InfoTooltip>
                  <span>{score.totalTagsA + score.totalTagsB} elementos totales</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-[0.7rem] text-slate-500 italic">
          Nota metodológica: 0	30% indica baja similitud (enfoques regulatorios distintos), 30	60% convergencia media y valores superiores a 60% una alta alineación de marcos normativos.
        </div>
      </div>

      {/* Comparación de Prácticas Regulatorias */}
      <div>
        <h4 className="text-sm font-semibold text-slate-800 mb-5 uppercase tracking-widest flex items-center border-b border-slate-200 pb-2">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
            <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" />
          </svg>
          Inventario de Prácticas Regulatorias
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center mb-4 pb-3 border-b border-slate-200">
              <CountryFlag flag={countryA.flag} size="md" />
              <span className="ml-3 text-base font-bold text-slate-900 uppercase tracking-wide">{countryA.name}</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded">
                <span className="text-xs text-slate-600 uppercase tracking-wider font-semibold">Total de Prácticas</span>
                <span className="text-2xl font-extrabold text-sky-800">
                  {categories.reduce((sum, cat) => {
                    const practice = countryA.practices[cat];
                    return sum + (practice?.tags.length || 0);
                  }, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded">
                <span className="text-xs text-slate-600 uppercase tracking-wider font-semibold">Categorías Cubiertas</span>
                <span className="text-2xl font-extrabold text-emerald-800">{categoryScores.length}/8</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center mb-4 pb-3 border-b border-slate-200">
              <CountryFlag flag={countryB.flag} size="md" />
              <span className="ml-3 text-base font-bold text-slate-900 uppercase tracking-wide">{countryB.name}</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded">
                <span className="text-xs text-slate-600 uppercase tracking-wider font-semibold">Total de Prácticas</span>
                <span className="text-2xl font-extrabold text-indigo-800">
                  {categories.reduce((sum, cat) => {
                    const practice = countryB.practices[cat];
                    return sum + (practice?.tags.length || 0);
                  }, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded">
                <span className="text-xs text-slate-600 uppercase tracking-wider font-semibold">Categorías Cubiertas</span>
                <span className="text-2xl font-extrabold text-emerald-800">{categoryScores.length}/8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

