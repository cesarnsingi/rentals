import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { listingsApi } from '../lib/api';
import { FilterState } from '../types';
import ListingCard from '../components/listing/ListingCard';
import FilterPanel from '../components/listing/FilterPanel';
import { Spinner, Empty } from '../components/ui';

const DEFAULT_FILTERS: FilterState = {
  city: '', type: '', minPrice: '', maxPrice: '',
  bedrooms: '', furnished: '', amenities: [],
  search: '', sort: '-createdAt', page: 1,
};

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters]   = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    city:   searchParams.get('city')   ?? '',
    type:   searchParams.get('type')   ?? '',
    search: searchParams.get('search') ?? '',
  });

  const updateFilters = (partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const resetFilters = () => setFilters({ ...DEFAULT_FILTERS });

  // Sync to URL
  useEffect(() => {
    const p: Record<string, string> = {};
    if (filters.city)     p.city     = filters.city;
    if (filters.type)     p.type     = filters.type;
    if (filters.search)   p.search   = filters.search;
    if (filters.minPrice) p.minPrice = filters.minPrice;
    if (filters.maxPrice) p.maxPrice = filters.maxPrice;
    if (filters.page > 1) p.page     = String(filters.page);
    setSearchParams(p, { replace: true });
  }, [filters]);

  const queryParams = {
    ...filters,
    amenities: filters.amenities.join(',') || undefined,
    furnished: filters.furnished || undefined,
    limit:     12,
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['listings', queryParams],
    queryFn:  () => listingsApi.getAll(queryParams as any).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const listings   = data?.listings ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total      = data?.total ?? 0;

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">
              {filters.city ? `Imóveis em ${filters.city}` : 'Todos os Imóveis'}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {isLoading ? 'A pesquisar...' : `${total} resultado${total !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300"
          >
            {showFilters ? <X size={16} /> : <SlidersHorizontal size={16} />}
            Filtros
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filter - desktop always visible, mobile toggleable */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
            <FilterPanel
              filters={filters}
              onChange={updateFilters}
              onReset={resetFilters}
              resultCount={total}
            />
          </div>

          {/* Listings grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex justify-center py-24"><Spinner size="lg" /></div>
            ) : listings.length === 0 ? (
              <Empty icon="🏠" title="Nenhum imóvel encontrado" subtitle="Tenta ajustar os filtros de pesquisa." />
            ) : (
              <>
                <div className={`grid gap-4 ${isFetching ? 'opacity-70' : ''} grid-cols-1 sm:grid-cols-2 xl:grid-cols-3`}>
                  {listings.map((l) => <ListingCard key={l._id} listing={l} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <button
                      onClick={() => updateFilters({ page: filters.page - 1 })}
                      disabled={filters.page === 1}
                      className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 disabled:opacity-40 hover:border-gray-600"
                    >
                      ← Anterior
                    </button>
                    {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                      const pg = i + 1;
                      return (
                        <button
                          key={pg}
                          onClick={() => updateFilters({ page: pg })}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                            pg === filters.page
                              ? 'bg-gold-500 text-black'
                              : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          {pg}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => updateFilters({ page: filters.page + 1 })}
                      disabled={filters.page >= totalPages}
                      className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 disabled:opacity-40 hover:border-gray-600"
                    >
                      Próx →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
