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
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Paso a paso para guiar al usuario */}
        <section className="mb-8 bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm">
          <h2 className="text-xs font-semibold tracking-[0.22em] text-slate-600 uppercase mb-3">
            Proceso de análisis comparativo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs md:text-sm">
            <div className={`flex items-start gap-3 rounded-lg p-3 border ${stepClasses(1)} transition-colors`}>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-slate-300 text-xs font-bold text-slate-700">
                1
              </div>
              <div>
                <div className="font-semibold uppercase tracking-[0.14em] text-[0.68rem] mb-1">
                  Seleccione el país de referencia (A)
                </div>
                <p className="text-[0.72rem] md:text-xs opacity-90">
                  Usualmente República Dominicana como punto de partida para el análisis.
                </p>
              </div>
            </div>
            <div className={`flex items-start gap-3 rounded-lg p-3 border ${stepClasses(2)} transition-colors`}>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-slate-300 text-xs font-bold text-slate-700">
                2
              </div>
              <div>
                <div className="font-semibold uppercase tracking-[0.14em] text-[0.68rem] mb-1">
                  Seleccione el país comparador (B)
                </div>
                <p className="text-[0.72rem] md:text-xs opacity-90">
                  El dashboard generará automáticamente la comparación regulatoria bilateral.
                </p>
              </div>
            </div>
            <div className={`flex items-start gap-3 rounded-lg p-3 border ${stepClasses(3)} transition-colors`}>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-slate-300 text-xs font-bold text-slate-700">
                3
              </div>
              <div>
                <div className="font-semibold uppercase tracking-[0.14em] text-[0.68rem] mb-1">
                  Revise sectores y recomendaciones
                </div>
                <p className="text-[0.72rem] md:text-xs opacity-90">
                  Explore los sectores regulatorios y las recomendaciones priorizadas para INDOTEL.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Selector de países */}
        <div className="mb-8">
          <CountrySelector
            countries={countries}
            selectedCountryId={selectedCountryA}
            onSelectCountry={setSelectedCountryA}
            label="País Principal (A)"
          />
          <CountrySelector
            countries={countries.filter((c) => c.id !== selectedCountryA)}
            selectedCountryId={selectedCountryB}
            onSelectCountry={setSelectedCountryB}
            label="Comparar con (País B)"
            comparisonMode={true}
          />
        </div>

        {/* Dashboard Analítico - Solo se muestra si hay dos países seleccionados */}
        {countryA && countryB && (
          <>
            <ExecutiveSummary
              countryA={countryA}
              countryB={countryB}
            />
            <AnalyticsDashboard
              countryA={countryA}
              countryB={countryB}
              allCountries={countries}
            />
            <ComparisonTable
              countryA={countryA}
              countryB={countryB}
            />
          </>
        )}

        {/* Layout principal: 3 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna izquierda: Categorías */}
          <div className="lg:col-span-2">
            <CategoryTabs
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              countryAName={countryA?.name}
              countryBName={countryB?.name}
            />
          </div>

          {/* Columna central: Comparación */}
          <div className="lg:col-span-7">
            <ComparisonPanel
              countryA={countryA}
              countryB={countryB}
              category={selectedCategory}
            />
          </div>

          {/* Columna derecha: Recomendaciones IA + Chat comparativo */}
          <div id="ai-panel" className="lg:col-span-3 space-y-4">
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
          </div>
        </div>
      </main>
    </div>
  );
}


