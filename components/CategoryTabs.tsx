"use client";

import type { Category } from "@/data/countries";
import { categories } from "@/data/countries";
import InfoTooltip from "./InfoTooltip";
import InlineChat from "./InlineChat";

interface CategoryTabsProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  countryAName?: string | null;
  countryBName?: string | null;
}

export default function CategoryTabs({
  selectedCategory,
  onSelectCategory,
  countryAName,
  countryBName,
}: CategoryTabsProps) {
  const categoryShortNames: Record<Category, string> = {
    "Espectro radioeléctrico": "Espectro",
    "Competencia Económica": "Competencia",
    "Ciberseguridad": "Ciberseguridad",
    "Protección del usuario": "Protección",
    "Tecnologías emergentes": "Tecnologías",
    "Compartición de la infraestructura": "Infraestructura",
    "Telecomunicaciones de emergencia": "Emergencia",
    "Homologación de productos y dispositivos": "Homologación",
  };

  const categoryDescriptions: Record<Category, { descripcion: string; preguntaIA: string; recomendacion: string }> = {
    "Espectro radioeléctrico": {
      descripcion: "Cómo se asignan, administran y reorganizan las bandas de frecuencias para servicios móviles, fijos y satelitales.",
      preguntaIA:
        "¿Qué ajustes podría hacer INDOTEL en sus procesos de subasta y refarming para acercarse al modelo de {paisComparador} en gestión de espectro?",
      recomendacion:
        "Revisar el calendario de subastas y los criterios de reserva de espectro para nuevos entrantes y 5G.",
    },
    "Competencia Económica": {
      descripcion: "Reglas para evitar concentración, promover nuevos entrantes y asegurar condiciones equitativas entre operadores.",
      preguntaIA:
        "¿Qué medidas pro-competencia concretas podría adoptar INDOTEL tomando como referencia a {paisComparador}?",
      recomendacion:
        "Evaluar si se requieren obligaciones adicionales de acceso mayorista u OMV para dinamizar el mercado.",
    },
    "Ciberseguridad": {
      descripcion: "Estrategias, obligaciones y coordinación para proteger redes y servicios críticos frente a incidentes digitales.",
      preguntaIA:
        "¿Qué elementos clave debería incorporar INDOTEL en una hoja de ruta de ciberseguridad inspirada en {paisComparador}?",
      recomendacion:
        "Fortalecer protocolos de reporte de incidentes y coordinación público-privada en infraestructura crítica.",
    },
    "Protección del usuario": {
      descripcion: "Derechos de los usuarios de servicios TIC, transparencia, calidad de servicio y mecanismos de reclamo.",
      preguntaIA:
        "¿Qué mejoras regulatorias permitirían reforzar la protección de los usuarios en línea con las prácticas de {paisComparador}?",
      recomendacion:
        "Actualizar reglamentos de derechos de los clientes y simplificar canales de reclamo y resolución de controversias.",
    },
    "Tecnologías emergentes": {
      descripcion: "Enfoque regulatorio para IoT, 5G, servicios digitales y modelos innovadores (sandbox, pilotos, etc.).",
      preguntaIA:
        "¿Qué diseño de sandbox o pilotos regulatorios podría implementar INDOTEL tomando como referencia a {paisComparador}?",
      recomendacion:
        "Diseñar un programa piloto para probar servicios 5G/IoT con reglas claras y plazos definidos.",
    },
    "Compartición de la infraestructura": {
      descripcion: "Reglas para compartir torres, fibra y demás infraestructura, reduciendo costos y acelerando el despliegue.",
      preguntaIA:
        "¿Qué esquema de compartición de infraestructura de {paisComparador} sería más fácil de adaptar al contexto dominicano?",
      recomendacion:
        "Reforzar obligaciones de compartición en zonas rurales y revisar incentivos para acuerdos voluntarios urbanos.",
    },
    "Telecomunicaciones de emergencia": {
      descripcion: "Mecanismos regulatorios para asegurar comunicaciones confiables durante desastres y emergencias.",
      preguntaIA:
        "¿Cómo podría INDOTEL modernizar su sistema de alertas y comunicaciones de emergencia inspirado en {paisComparador}?",
      recomendacion:
        "Consolidar un sistema de alertas tempranas por difusión celular coordinado con las autoridades de emergencia.",
    },
    "Homologación de productos y dispositivos": {
      descripcion: "Procedimientos para certificar equipos de telecomunicaciones según estándares técnicos y de seguridad.",
      preguntaIA:
        "¿Qué mejoras en el proceso de homologación aplicadas en {paisComparador} podrían simplificar trámites sin perder control?",
      recomendacion:
        "Digitalizar por completo la homologación y reconocer certificaciones de laboratorios internacionales acreditados.",
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wide">Categorías</h3>
      <div className="space-y-2">
        {categories.map((category) => {
          const desc = categoryDescriptions[category];
          const paisComparador = countryBName || "el país comparador (B)";
          const pregunta = desc.preguntaIA.replace("{paisComparador}", paisComparador);
          const contexto = `País de referencia (A): ${countryAName || "República Dominicana"}. País comparador (B): ${paisComparador}. Categoría: ${category}.`;

          return (
            <InfoTooltip
              key={category}
              hideFooter
              content={
                <div className="space-y-2">
                  <p>{desc.descripcion}</p>
                  <div className="text-[0.68rem] text-slate-700">
                    <span className="font-semibold text-slate-900">Pregunta sugerida a la IA:</span>
                    <br />
                    <span>{pregunta}</span>
                  </div>
                  <div className="text-[0.68rem] text-emerald-700">
                    <span className="font-semibold">Recomendación adaptable:</span>
                    <br />
                    <span>{desc.recomendacion}</span>
                  </div>
                  <InlineChat initialQuestion={pregunta} context={contexto} />
                </div>
              }
            >
              <button
              onClick={() => onSelectCategory(category)}
              className={`
              w-full text-left px-4 py-3 rounded-lg transition-all
              ${
                selectedCategory === category
                  ? "bg-sky-600 text-white font-semibold shadow-sm"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
              }
            `}
          >
            {categoryShortNames[category]}
          </button>
            </InfoTooltip>
          );
        })}
      </div>
    </div>
  );
}


