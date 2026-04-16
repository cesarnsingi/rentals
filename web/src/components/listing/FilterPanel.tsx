import React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { FilterState } from '../../types';
import { ANGOLA_CITIES, PROPERTY_TYPES, AMENITIES } from '../../lib/utils';
import { Button, Select, Input } from '../ui';

interface Props {
  filters:    FilterState;
  onChange:   (f: Partial<FilterState>) => void;
  onReset:    () => void;
  resultCount: number;
}

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Mais recentes' },
  { value: 'price',      label: 'Preço: baixo → alto' },
  { value: '-price',     label: 'Preço: alto → baixo' },
  { value: '-viewCount', label: 'Mais vistos' },
];

const BEDROOM_OPTIONS = [
  { value: '', label: 'Qualquer' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
];

export default function FilterPanel({ filters, onChange, onReset, resultCount }: Props) {
  const toggleAmenity = (a: string) => {
    const next = filters.amenities.includes(a)
      ? filters.amenities.filter((x) => x !== a)
      : [...filters.amenities, a];
    onChange({ amenities: next });
  };

  const activeCount = [
    filters.city, filters.type, filters.minPrice, filters.maxPrice,
    filters.bedrooms, filters.furnished, filters.amenities.length > 0,
  ].filter(Boolean).length;

  return (
    <aside className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-6 sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-gold-400" />
          <span className="font-semibold text-white text-sm">Filtros</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 bg-gold-500 rounded-full text-[10px] font-bold text-black flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={onReset} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
            <X size={12} />Limpar
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500">{resultCount} imóveis encontrados</p>

      {/* City */}
      <Select
        label="Cidade"
        value={filters.city}
        onChange={(e) => onChange({ city: e.target.value, page: 1 })}
        options={[{ value: '', label: 'Todas as cidades' }, ...ANGOLA_CITIES.map((c) => ({ value: c, label: c }))]}
      />

      {/* Type */}
      <Select
        label="Tipo de imóvel"
        value={filters.type}
        onChange={(e) => onChange({ type: e.target.value, page: 1 })}
        options={[{ value: '', label: 'Todos os tipos' }, ...PROPERTY_TYPES]}
      />

      {/* Price range */}
      <div>
        <label className="text-sm font-medium text-gray-300 block mb-2">Preço (AOA / mês)</label>
        <div className="flex gap-2">
          <Input
            placeholder="Mín"
            type="number"
            value={filters.minPrice}
            onChange={(e) => onChange({ minPrice: e.target.value, page: 1 })}
          />
          <Input
            placeholder="Máx"
            type="number"
            value={filters.maxPrice}
            onChange={(e) => onChange({ maxPrice: e.target.value, page: 1 })}
          />
        </div>
      </div>

      {/* Bedrooms */}
      <Select
        label="Quartos"
        value={filters.bedrooms}
        onChange={(e) => onChange({ bedrooms: e.target.value, page: 1 })}
        options={BEDROOM_OPTIONS}
      />

      {/* Furnished */}
      <div>
        <label className="text-sm font-medium text-gray-300 block mb-2">Estado</label>
        <div className="flex gap-2">
          {[
            { value: '', label: 'Todos' },
            { value: 'true', label: 'Mobilado' },
            { value: 'false', label: 'Sem mobília' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ furnished: opt.value, page: 1 })}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors border ${
                filters.furnished === opt.value
                  ? 'bg-gold-500/20 border-gold-500 text-gold-400'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <Select
        label="Ordenar"
        value={filters.sort}
        onChange={(e) => onChange({ sort: e.target.value as any, page: 1 })}
        options={SORT_OPTIONS}
      />

      {/* Amenities */}
      <div>
        <label className="text-sm font-medium text-gray-300 block mb-2">Comodidades</label>
        <div className="flex flex-wrap gap-1.5">
          {AMENITIES.map((a) => (
            <button
              key={a}
              onClick={() => toggleAmenity(a)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
                filters.amenities.includes(a)
                  ? 'bg-gold-500/20 border-gold-500 text-gold-400'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
