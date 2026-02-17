"use client";

import { useState } from "react";
import Header from "@/components/Header";
import CountrySelector from "@/components/CountrySelector";
import CategoryTabs from "@/components/CategoryTabs";
import ComparisonPanel from "@/components/ComparisonPanel";
import AIRecommendations from "@/components/AIRecommendations";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import ComparisonTable from "@/components/ComparisonTable";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import ComparisonChatBox from "@/components/ComparisonChatBox";
import { countries, categories, type Category } from "@/data/countries";
import type { Country } from "@/data/countries";

export default function Home() {
  const [selectedCountryA, setSelectedCountryA] = useState<string | null>(
    "rep_dominicana"
  );
  const [selectedCountryB, setSelectedCountryB] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    categories[0]
  );

  const countryA = countries.find((c) => c.id === selectedCountryA) || null;
  const countryB = countries.find((c) => c.id === selectedCountryB) || null;

  const hasCountryA = !!countryA;
  const hasCountryB = !!countryB;
  const activeStep = !hasCountryA ? 1 : !hasCountryB ? 2 : 3;

  const stepClasses = (step: number) => {
    if (step === activeStep) {
      return "border-sky-600 bg-sky-50 text-sky-900";
    }
    if (step < activeStep) {
      return "border-emerald-600 bg-emerald-50 text-emerald-900";
    }
    return "border-slate-200 bg-slate-50 text-slate-600";
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-[1400px] px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <section className="mb-8 rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm backdrop-blur md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-sky-700">
                Comparador inteligente REGULATEL
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Identifica brechas regulatorias y prioriza acciones para INDOTEL
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-[0.95rem]">
                Selecciona dos países, revisa su convergencia por categoría y usa el panel
                de IA para convertir hallazgos en recomendaciones accionables.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3 sm:text-[0.78rem]">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="font-semibold text-slate-900">País A</div>
                <div className="text-slate-600">{countryA?.name || "No seleccionado"}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="font-semibold text-slate-900">País B</div>
                <div className="text-slate-600">{countryB?.name || "No seleccionado"}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="font-semibold text-slate-900">Categoría activa</div>
                <div className="text-slate-600">{selectedCategory}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm md:p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Flujo de análisis comparativo
          </h2>
          <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-3 md:text-sm">
            <div className={`flex items-start gap-3 rounded-xl border p-3.5 ${stepClasses(1)} transition-colors`}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-bold text-slate-700">
                1
              </div>
              <div>
                <p className="mb-1 font-semibold uppercase tracking-[0.14em] text-[0.66rem]">
                  País de referencia
                </p>
                <p className="text-[0.73rem] opacity-90 md:text-xs">
                  Define el país base del diagnóstico (A).
                </p>
              </div>
            </div>
            <div className={`flex items-start gap-3 rounded-xl border p-3.5 ${stepClasses(2)} transition-colors`}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-bold text-slate-700">
                2
              </div>
              <div>
                <p className="mb-1 font-semibold uppercase tracking-[0.14em] text-[0.66rem]">
                  País comparador
                </p>
                <p className="text-[0.73rem] opacity-90 md:text-xs">
                  Selecciona el benchmark regional (B).
                </p>
              </div>
            </div>
            <div className={`flex items-start gap-3 rounded-xl border p-3.5 ${stepClasses(3)} transition-colors`}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-bold text-slate-700">
                3
              </div>
              <div>
                <p className="mb-1 font-semibold uppercase tracking-[0.14em] text-[0.66rem]">
                  Evaluación y acciones
                </p>
                <p className="text-[0.73rem] opacity-90 md:text-xs">
                  Revisa brechas por categoría y solicita recomendaciones IA.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm md:p-6">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <CountrySelector
              countries={countries}
              selectedCountryId={selectedCountryA}
              onSelectCountry={setSelectedCountryA}
              label="País principal (A)"
            />
            <CountrySelector
              countries={countries.filter((c) => c.id !== selectedCountryA)}
              selectedCountryId={selectedCountryB}
              onSelectCountry={setSelectedCountryB}
              label="País comparador (B)"
              comparisonMode={true}
            />
          </div>
        </section>

        {countryA && countryB && (
          <section className="mb-8 space-y-6">
            <ExecutiveSummary countryA={countryA} countryB={countryB} />
            <AnalyticsDashboard
              countryA={countryA}
              countryB={countryB}
              allCountries={countries}
            />
            <ComparisonTable countryA={countryA} countryB={countryB} />
          </section>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <aside className="xl:col-span-3">
            <div className="xl:sticky xl:top-6">
              <CategoryTabs
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                countryAName={countryA?.name}
                countryBName={countryB?.name}
              />
            </div>
          </aside>

          <section className="xl:col-span-6">
            <ComparisonPanel
              countryA={countryA}
              countryB={countryB}
              category={selectedCategory}
            />
          </section>

          <aside id="ai-panel" className="space-y-4 xl:col-span-3">
            <AIRecommendations
              countryA={countryA}
              countryB={countryB}
              category={selectedCategory}
            />
            <ComparisonChatBox
              countryA={countryA}
              countryB={countryB}
              category={selectedCategory}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}


