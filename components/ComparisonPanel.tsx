"use client";

import { useState } from "react";
import type { Country, Category } from "@/data/countries";
import { getSimilarities } from "@/lib/similarities";
import CountryFlag from "./CountryFlag";
import InfoTooltip from "./InfoTooltip";
import { countrySources, countryCategorySources } from "@/data/sources";

interface ComparisonPanelProps {
  countryA: Country | null;
  countryB: Country | null;
  category: Category;
}

const formatTag = (tag: string): string => {
  const map: Record<string, string> = {
    // Casos que se ven feos o muy técnicos
    reserva_espectro: "Reserva de espectro para nuevos entrantes",
    nuevos_operadores: "Facilitación de entrada de nuevos operadores",
    inscripcion_equipos: "Inscripción / registro de equipos de telecomunicaciones",

    // Términos frecuentes
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
    comparticion_obligatoria: "Compartición obligatoria de infraestructura",
    comparticion_voluntaria: "Compartición voluntaria de infraestructura",
    alertas_emergencia: "Sistema de alertas de emergencia",
    difusion_celular: "Difusión celular de mensajes de alerta",
    alfabetizacion_digital: "Programas de alfabetización y capacitación digital",
    reglamento_clientes: "Reglamento de derechos de clientes TIC",
    servicio_esenciales: "Protección de servicios esenciales",
    plan_nacional_frecuencias: "Plan Nacional de Frecuencias",
    cabfra: "Cuadro de atribución de bandas de frecuencias (CABFRA)",
    sandbox: "Sandbox regulatorio para nuevas tecnologías",
    tecnologias_digitales: "Nuevas tecnologías y servicios digitales",

    // Siglas / etiquetas comunes
    "5g": "Redes 5G",
    iot: "Internet de las Cosas (IoT)",
    imt: "Telecomunicaciones móviles internacionales (IMT)",
    ley_31_1996: "Ley 31 de 1996 (marco básico de telecomunicaciones)",
    pnaf: "Plan Nacional de Atribución de Frecuencias (PNAF)",
    res_jd_107_1997: "Resolución JD-107 de 1997 del PNAF",
    licitacion_01_2023_telco: "Licitación Pública 01-2023-TELCO",
    asignacion: "Mecanismos de asignación de frecuencias",
    refarming: "Procesos de refarming de espectro",
  };

  if (map[tag as keyof typeof map]) {
    return map[tag as keyof typeof map];
  }

  // Fallback genérico: snake_case -> frase legible
  const cleaned = tag.replace(/_/g, " ");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const getTagExplanation = (
  tag: string,
  countryName: string,
  otherCountryName: string
): string => {
  const label = formatTag(tag);

  const map: Record<string, string> = {
    asignacion:
      `El regulador de ${countryName} documenta procedimientos específicos de asignación de frecuencias (además de licitaciones), mientras que en ${otherCountryName} la ficha no detalla mecanismos equivalentes para esta categoría.`,
    refarming:
      `Solo ${countryName} menciona explícitamente procesos de refarming para reorganizar bandas de espectro y migrar servicios a tecnologías más eficientes; en ${otherCountryName} no se registran medidas de refarming en esta categoría.`,
    ley_31_1996:
      `${countryName} vincula esta práctica directamente con la Ley 31 de 1996 como ley base del régimen de telecomunicaciones, algo que no aparece de forma análoga en la ficha de ${otherCountryName}.`,
    pnaf:
      `El Plan Nacional de Atribución de Frecuencias (PNAF) de ${countryName} se usa como instrumento central para ordenar bandas y liberar espectro, mientras que en ${otherCountryName} esta herramienta no figura como práctica destacada en la fuente.`,
    res_jd_107_1997:
      `La Resolución JD-107 de 1997 se cita como acto fundacional del PNAF de ${countryName}, lo que refleja una trayectoria regulatoria propia que no está presente en la documentación de ${otherCountryName}.`,
    licitacion_01_2023_telco:
      `La Licitación Pública 01-2023-TELCO aparece solo en ${countryName} como ejemplo concreto de concurso de espectro con objetivos de competencia y continuidad de servicios, sin paralelo en la ficha de ${otherCountryName}.`,
    imt:
      `${countryName} destaca la planificación específica de bandas para servicios IMT (4G/5G) en esta categoría, mientras que ${otherCountryName} no tiene referencias equivalentes aquí.`,
    "5g":
      `${countryName} incorpora expresamente el despliegue de redes 5G en esta dimensión, algo que no figura como práctica registrada para ${otherCountryName} en la misma categoría.`,
  };

  if (map[tag as keyof typeof map]) {
    return map[tag as keyof typeof map];
  }

  return `Solo ${countryName} presenta prácticas relacionadas con "${label}" en esta categoría, mientras que en ${otherCountryName} no se registran medidas equivalentes en la fuente consultada.`;
};

export default function ComparisonPanel({
  countryA,
  countryB,
  category,
}: ComparisonPanelProps) {
  const [showDetailsA, setShowDetailsA] = useState(false);
  const [showDetailsB, setShowDetailsB] = useState(false);

  if (!countryA || !countryB) {
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center text-slate-600 shadow-sm">
        Selecciona dos países para comparar
      </div>
    );
  }

  const practiceA = countryA.practices[category];
  const practiceB = countryB.practices[category];

  const categorySourcesA =
    countryCategorySources[countryA.id]?.[category] || null;
  const categorySourcesB =
    countryCategorySources[countryB.id]?.[category] || null;

  if (!practiceA || !practiceB) {
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center text-slate-600 shadow-sm">
        No hay información disponible para esta categoría
      </div>
    );
  }

  const similarities = getSimilarities(practiceA, practiceB);

  return (
    <div className="space-y-6">
      {/* Título de la categoría */}
      <div className="bg-sky-50 rounded-xl border border-sky-200 p-5 shadow-sm">
        <h2 className="text-2xl font-bold text-sky-900">{category}</h2>
      </div>

      {/* Tarjetas de países */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* País A */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-sky-200 md:p-8 p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
            <CountryFlag flag={countryA.flag} size="lg" />
            <h3 className="text-lg font-bold text-slate-900">{countryA.name}</h3>
            {countrySources[countryA.id] && (
              <InfoTooltip
                hideFooter
                content={
                  <div>
                    <p className="mb-1 font-semibold text-slate-900">Fuente de la información</p>
                    <p className="mb-2 text-slate-700">
                      {countrySources[countryA.id].confidence === "real-complete" &&
                        "Descripción sintetizada a partir de la ficha oficial de REGULATEL para este país."}
                      {countrySources[countryA.id].confidence === "real-partial" &&
                        "Combinación de datos reales de REGULATEL en algunas categorías y descripciones complementarias en otras. Revisar siempre los documentos fuentes."}
                      {countrySources[countryA.id].confidence === "example" &&
                        "Descripción de ejemplo basada en prácticas típicas; debe contrastarse con la ficha de REGULATEL y las normas del regulador nacional."}
                    </p>
                    {categorySourcesA && categorySourcesA.length > 0 && (
                      <div className="mb-2 text-[0.7rem] text-slate-700">
                        <p className="mb-1 font-semibold">Documentos normativos clave para &quot;{category}&quot;:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {categorySourcesA.map((src) => (
                            <li key={src.url} className="truncate">
                              <a href={src.url} target="_blank" rel="noreferrer" className="text-sky-700 underline hover:text-sky-900">
                                {src.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <a href={countrySources[countryA.id].url} target="_blank" rel="noreferrer" className="font-semibold text-sky-700 underline hover:text-sky-900">
                      Ver ficha completa en REGULATEL ({countrySources[countryA.id].label})
                    </a>
                  </div>
                }
              >
                <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-400 bg-slate-700 text-[0.65rem] font-medium text-white hover:bg-slate-600" aria-label="Ver fuente de datos">
                  i
                </button>
              </InfoTooltip>
            )}
          </div>
          <div className="min-w-0 flex-1">
            {(() => {
              const text = showDetailsA ? practiceA.details : practiceA.summary;
              const paragraphs = text.split(/\n\n+/).filter(Boolean);
              const isExpanded = showDetailsA && practiceA.details && practiceA.details !== practiceA.summary;
              return (
                <>
                  <div className={isExpanded ? "space-y-4 text-[15px] leading-[1.7] text-slate-800" : "text-slate-800 leading-relaxed"}>
                    {paragraphs.length > 1 ? (
                      paragraphs.map((para, i) => (
                        <p key={i} className="text-justify">{para.trim()}</p>
                      ))
                    ) : (
                      <p className="text-justify">{text}</p>
                    )}
                  </div>
                  {practiceA.details && practiceA.details !== practiceA.summary && (
                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowDetailsA((prev) => !prev)}
                        className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-800 transition-colors hover:bg-sky-100 hover:border-sky-300"
                        aria-expanded={showDetailsA}
                      >
                        {showDetailsA ? "Ocultar detalles" : "Ver texto completo"}
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          {countrySources[countryA.id]?.confidence !== "real-complete" && (
            <div className="mt-5 rounded-xl border-l-4 border-amber-400 bg-amber-50/90 px-4 py-3 text-[0.8rem] leading-relaxed text-amber-900">
              Aviso: esta ficha debe validarse con la documentación oficial antes de usarse en informes formales.
            </div>
          )}
        </div>

        {/* País B */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-sky-200 md:p-8 p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
            <CountryFlag flag={countryB.flag} size="lg" />
            <h3 className="text-lg font-bold text-slate-900">{countryB.name}</h3>
            {countrySources[countryB.id] && (
              <InfoTooltip
                hideFooter
                content={
                  <div>
                    <p className="mb-1 font-semibold text-slate-900">Fuente de la información</p>
                    <p className="mb-2 text-slate-700">
                      {countrySources[countryB.id].confidence === "real-complete" &&
                        "Descripción sintetizada a partir de la ficha oficial de REGULATEL para este país."}
                      {countrySources[countryB.id].confidence === "real-partial" &&
                        "Combinación de datos reales de REGULATEL en algunas categorías y descripciones complementarias en otras. Revisar siempre los documentos fuentes."}
                      {countrySources[countryB.id].confidence === "example" &&
                        "Descripción de ejemplo basada en prácticas típicas; debe contrastarse con la ficha de REGULATEL y las normas del regulador nacional."}
                    </p>
                    {categorySourcesB && categorySourcesB.length > 0 && (
                      <div className="mb-2 text-[0.7rem] text-slate-700">
                        <p className="mb-1 font-semibold">Documentos normativos clave para &quot;{category}&quot;:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {categorySourcesB.map((src) => (
                            <li key={src.url} className="truncate">
                              <a href={src.url} target="_blank" rel="noreferrer" className="text-sky-700 underline hover:text-sky-900">
                                {src.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <a href={countrySources[countryB.id].url} target="_blank" rel="noreferrer" className="font-semibold text-sky-700 underline hover:text-sky-900">
                      Ver ficha completa en REGULATEL ({countrySources[countryB.id].label})
                    </a>
                  </div>
                }
              >
                <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-400 bg-slate-700 text-[0.65rem] font-medium text-white hover:bg-slate-600" aria-label="Ver fuente de datos">
                  i
                </button>
              </InfoTooltip>
            )}
          </div>
          <div className="min-w-0 flex-1">
            {(() => {
              const text = showDetailsB ? practiceB.details : practiceB.summary;
              const paragraphs = text.split(/\n\n+/).filter(Boolean);
              const isExpanded = showDetailsB && practiceB.details && practiceB.details !== practiceB.summary;
              return (
                <>
                  <div className={isExpanded ? "space-y-4 text-[15px] leading-[1.7] text-slate-800" : "text-slate-800 leading-relaxed"}>
                    {paragraphs.length > 1 ? (
                      paragraphs.map((para, i) => (
                        <p key={i} className="text-justify">{para.trim()}</p>
                      ))
                    ) : (
                      <p className="text-justify">{text}</p>
                    )}
                  </div>
                  {practiceB.details && practiceB.details !== practiceB.summary && (
                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowDetailsB((prev) => !prev)}
                        className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-800 transition-colors hover:bg-sky-100 hover:border-sky-300"
                        aria-expanded={showDetailsB}
                      >
                        {showDetailsB ? "Ocultar detalles" : "Ver texto completo"}
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          {countrySources[countryB.id]?.confidence !== "real-complete" && (
            <div className="mt-5 rounded-xl border-l-4 border-amber-400 bg-amber-50/90 px-4 py-3 text-[0.8rem] leading-relaxed text-amber-900">
              Aviso: esta ficha debe validarse con la documentación oficial antes de usarse en informes formales.
            </div>
          )}
        </div>
      </div>

      {/* Similitudes */}
      {similarities.common.length > 0 && (
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center">
            <span className="mr-2">✓</span>
            Similitudes
          </h3>
          <ul className="space-y-2">
            {similarities.common.map((tag, index) => (
              <li key={index} className="flex items-start">
                <span className="text-emerald-700 mr-3 font-bold">•</span>
                <span className="text-emerald-900">
                  Ambos países tienen prácticas relacionadas con:{" "}
                  <strong className="text-emerald-900 font-semibold">{formatTag(tag)}</strong>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Diferencias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {similarities.onlyA.length > 0 && (
          <div className="bg-sky-50 rounded-xl border border-sky-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-sky-900 mb-4">
              Elementos únicos de {countryA.name}
            </h3>
            <ul className="space-y-2">
              {similarities.onlyA.map((tag, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-sky-700 mr-3 font-bold">•</span>
                  <span className="text-sky-900">
                    <InfoTooltip
                      hideFooter
                      content={
                        <p>
                          {getTagExplanation(tag, countryA.name, countryB.name)}
                        </p>
                      }
                    >
                      <span className="underline decoration-dotted decoration-sky-400/80">
                        <strong className="text-sky-900">{formatTag(tag)}</strong>
                      </span>
                    </InfoTooltip>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {similarities.onlyB.length > 0 && (
          <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-indigo-900 mb-4">
              Elementos únicos de {countryB.name}
            </h3>
            <ul className="space-y-2">
              {similarities.onlyB.map((tag, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-indigo-700 mr-3 font-bold">•</span>
                  <span className="text-indigo-900">
                    <InfoTooltip
                      hideFooter
                      content={
                        <p>
                          {getTagExplanation(tag, countryB.name, countryA.name)}
                        </p>
                      }
                    >
                      <span className="underline decoration-dotted decoration-indigo-400/80">
                        <strong className="text-indigo-900">{formatTag(tag)}</strong>
                      </span>
                    </InfoTooltip>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}


