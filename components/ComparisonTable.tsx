"use client";

import type { Country, Category } from "@/data/countries";
import { categories } from "@/data/countries";
import { getSimilarities } from "@/lib/similarities";
import CountryFlag from "./CountryFlag";

interface ComparisonTableProps {
  countryA: Country | null;
  countryB: Country | null;
}

export default function ComparisonTable({
  countryA,
  countryB,
}: ComparisonTableProps) {
  if (!countryA || !countryB) {
    return null;
  }

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

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6 overflow-x-auto">
      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
        <span className="mr-2">📋</span>
        Tabla Comparativa
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 uppercase">
                Categoría
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                <div className="flex items-center justify-center">
                  <CountryFlag flag={countryA.flag} size="sm" />
                  <span className="ml-2">{countryA.name}</span>
                </div>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                <div className="flex items-center justify-center">
                  <CountryFlag flag={countryB.flag} size="sm" />
                  <span className="ml-2">{countryB.name}</span>
                </div>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                Similitud
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const practiceA = countryA.practices[category];
              const practiceB = countryB.practices[category];
              
              if (!practiceA || !practiceB) return null;
              
              const similarities = getSimilarities(practiceA, practiceB);
              const totalTags = practiceA.tags.length + practiceB.tags.length;
              const similarityPercent = totalTags > 0 
                ? Math.round((similarities.common.length / totalTags) * 100) 
                : 0;
              
              const hasData = practiceA.summary !== "Información no disponible en la fuente.";
              
              return (
                <tr key={category} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-slate-800">
                    {categoryShortNames[category]}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-500 mb-1">
                        {practiceA.tags.length} prácticas
                      </span>
                      {hasData ? (
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      ) : (
                        <span className="w-3 h-3 bg-slate-300 rounded-full"></span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-500 mb-1">
                        {practiceB.tags.length} prácticas
                      </span>
                      {hasData ? (
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      ) : (
                        <span className="w-3 h-3 bg-slate-300 rounded-full"></span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-16 bg-slate-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            similarityPercent > 50 
                              ? "bg-emerald-500" 
                              : similarityPercent > 25 
                              ? "bg-amber-400" 
                              : "bg-rose-400"
                          }`}
                          style={{ width: `${similarityPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 w-10 text-left">
                        {similarityPercent}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

