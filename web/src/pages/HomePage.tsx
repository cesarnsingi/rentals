import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, TrendingUp, Shield, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { listingsApi } from '../lib/api';
import { ANGOLA_CITIES, PROPERTY_TYPES } from '../lib/utils';
import ListingCard from '../components/listing/ListingCard';
import { Button, Spinner } from '../components/ui';

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [city, setCity]     = useState('');
  const [type, setType]     = useState('');

  const { data: featuredData, isLoading } = useQuery({
    queryKey: ['listings', 'featured'],
    queryFn:  () => listingsApi.getAll({ featured: true, limit: 8 }).then((r) => r.data),
  });

  const { data: recentData } = useQuery({
    queryKey: ['listings', 'recent'],
    queryFn:  () => listingsApi.getAll({ sort: '-createdAt', limit: 6 }).then((r) => r.data),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city)   params.set('city', city);
    if (type)   params.set('type', type);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 border-b border-gray-800">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gold-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-gold-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 mb-6">
              <MapPin size={14} className="text-gold-400" />
              <span className="text-gold-400 text-sm font-medium">Angola · Luanda · Benguela · Lubango</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Encontra o teu<br />
              <span className="text-gold-400">imóvel ideal</span> em Angola
            </h1>

            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              A maior plataforma de arrendamento de Angola. Apartamentos, casas e vivendas nas melhores localizações.
            </p>

            {/* Search form */}
            <form onSubmit={handleSearch} className="bg-gray-900 border border-gray-700 rounded-2xl p-3 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto shadow-2xl">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar por título, bairro..."
                  className="w-full bg-transparent pl-9 pr-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none"
                />
              </div>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-gold-500"
              >
                <option value="">Todas as cidades</option>
                {ANGOLA_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-gold-500"
              >
                <option value="">Tipo</option>
                {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <Button type="submit" size="md" className="shrink-0">
                <Search size={16} /> Pesquisar
              </Button>
            </form>

            {/* Quick links */}
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {ANGOLA_CITIES.slice(0, 5).map((c) => (
                <Link key={c} to={`/listings?city=${c}`}
                  className="px-3 py-1 bg-gray-800/60 hover:bg-gray-800 border border-gray-700 hover:border-gold-500/50 text-gray-400 hover:text-gold-400 rounded-full text-xs transition-all">
                  {c}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-b border-gray-800 bg-gray-900/30">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { n: '1,200+', label: 'Imóveis listados' },
            { n: '800+',   label: 'Proprietários activos' },
            { n: '4',      label: 'Cidades cobertas' },
            { n: '98%',    label: 'Clientes satisfeitos' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-gold-400 mb-1">{s.n}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured ── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Imóveis em Destaque</h2>
            <p className="text-gray-500 text-sm mt-1">Seleção premium para si</p>
          </div>
          <Link to="/listings?featured=true"><Button variant="outline" size="sm">Ver todos</Button></Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {featuredData?.listings.map((l) => <ListingCard key={l._id} listing={l} />)}
          </div>
        )}
      </section>

      {/* ── Recent ── */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Adicionados Recentemente</h2>
            <p className="text-gray-500 text-sm mt-1">Os mais novos no mercado</p>
          </div>
          <Link to="/listings"><Button variant="outline" size="sm">Explorar</Button></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentData?.listings.map((l) => <ListingCard key={l._id} listing={l} />)}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-t border-gray-800 bg-gray-900/30 py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Como Funciona</h2>
          <p className="text-gray-500 mb-10">Simples, rápido e seguro</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: <Search className="text-gold-400" size={28} />, title: 'Pesquisa', desc: 'Filtra por cidade, tipo e preço para encontrar o imóvel perfeito.' },
              { icon: <Phone className="text-gold-400" size={28} />,  title: 'Contacta', desc: 'Fala diretamente com o proprietário via WhatsApp ou chamada.' },
              { icon: <Shield className="text-gold-400" size={28} />, title: 'Arrenda',  desc: 'Confirma a visita, assina o contrato e muda-te.' },
            ].map((s) => (
              <div key={s.title} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-center justify-center mb-4">
                  {s.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
        <p>© 2025 AngolaRentals. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
