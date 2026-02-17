"use client";

import type { Country } from "@/data/countries";
import CountryFlag from "./CountryFlag";

interface CountrySelectorProps {
  countries: Country[];
  selectedCountryId: string | null;
  onSelectCountry: (countryId: string) => void;
  label: string;
  comparisonMode?: boolean;
}

export default function CountrySelector({
  countries,
  selectedCountryId,
  onSelectCountry,
  label,
  comparisonMode = false,
}: CountrySelectorProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {label}
        </label>
        {comparisonMode && (
          <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-indigo-700">
            Benchmark
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2.5">
        {countries.map((country) => (
          <button
            key={country.id}
            onClick={() => onSelectCountry(country.id)}
            className={`
              group relative flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-all
              hover:shadow-sm hover:-translate-y-[1px]
              ${
                selectedCountryId === country.id
                  ? "border-sky-400 bg-sky-50 ring-2 ring-sky-100"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }
            `}
            title={country.name}
          >
            <CountryFlag flag={country.flag} size="md" />
            <span
              className={`
              text-sm font-semibold
              ${selectedCountryId === country.id ? "text-sky-900" : "text-slate-700"}
            `}
            >
              {country.name}
            </span>
            {selectedCountryId === country.id && (
              <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-sm">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>
      {selectedCountryId && (() => {
        const selected = countries.find((c) => c.id === selectedCountryId);
        if (!selected) return null;
        return (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
            <span className="text-slate-500">Seleccionado:</span>
            <CountryFlag flag={selected.flag} size="sm" />
            <span className="font-bold text-sky-800">{selected.name}</span>
          </div>
        );
      })()}
    </div>
  );
}

