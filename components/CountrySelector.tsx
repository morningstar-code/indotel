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
    <div className="mb-6">
      <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
        {label}
      </label>
      <div className="flex flex-wrap gap-3">
        {countries.map((country) => (
          <button
            key={country.id}
            onClick={() => onSelectCountry(country.id)}
            className={`
              group relative flex items-center space-x-3
              px-5 py-3 rounded-xl border transition-all
              hover:shadow-sm
              ${
                selectedCountryId === country.id
                  ? "border-sky-600 bg-sky-50"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }
            `}
            title={country.name}
          >
            <CountryFlag flag={country.flag} size="md" />
            <span className={`
              text-sm font-semibold
              ${selectedCountryId === country.id ? "text-sky-900" : "text-slate-700"}
            `}>
              {country.name}
            </span>
            {selectedCountryId === country.id && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
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
          <div className="mt-4 text-sm text-slate-700 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 inline-flex items-center gap-2">
            <span>País seleccionado:</span>
            <CountryFlag flag={selected.flag} size="sm" />
            <span className="font-bold text-sky-800">{selected.name}</span>
          </div>
        );
      })()}
    </div>
  );
}

