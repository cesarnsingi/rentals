import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate, Link } from 'react-router-dom';
import { Heart, Calendar, Home, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { listingsApi, bookingsApi } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';
import ListingCard from '../../components/listing/ListingCard';
import { Badge, Button, Card, Spinner, Empty } from '../../components/ui';
import { formatPrice } from '../../lib/utils';
import toast from 'react-hot-toast';

const TAB_ICONS = { saved: Heart, bookings: Calendar, myListings: Home };

export default function DashboardPage() {
  const { user, isAuth } = useAuthStore();
  const [tab, setTab]    = useState<'saved' | 'bookings' | 'myListings'>('saved');
  const qc               = useQueryClient();

  if (!isAuth()) return <Navigate to="/login" />;

  const { data: saved, isLoading: loadingSaved } = useQuery({
    queryKey: ['saved'],
    queryFn:  () => listingsApi.getSaved().then((r) => r.data),
    enabled:  tab === 'saved',
  });

  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ['bookings'],
    queryFn:  () => bookingsApi.getAll().then((r) => r.data),
    enabled:  tab === 'bookings',
  });

  const { data: myListings, isLoading: loadingMy } = useQuery({
    queryKey: ['my-listings'],
    queryFn:  () => listingsApi.getMy().then((r) => r.data),
    enabled:  tab === 'myListings' && (user?.role === 'landlord' || user?.role === 'admin'),
  });

  const cancelBooking = useMutation({
    mutationFn: (id: string) => bookingsApi.updateStatus(id, 'cancelled'),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['bookings'] }); toast.success('Reserva cancelada'); },
  });

  const deleteListingMut = useMutation({
    mutationFn: (id: string) => listingsApi.delete(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['my-listings'] }); toast.success('Imóvel eliminado'); },
  });

  const TABS = [
    { key: 'saved',      label: 'Guardados',   show: true },
    { key: 'bookings',   label: 'Reservas',    show: true },
    { key: 'myListings', label: 'Os Meus Imóveis', show: user?.role === 'landlord' || user?.role === 'admin' },
  ].filter((t) => t.show);

  const BOOKING_STATUS: Record<string, { label: string; variant: any }> = {
    pending:   { label: 'Pendente',   variant: 'gold'  },
    confirmed: { label: 'Confirmado', variant: 'green' },
    cancelled: { label: 'Cancelado',  variant: 'red'   },
    completed: { label: 'Concluído',  variant: 'gray'  },
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Olá, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
          </div>
          {(user?.role === 'landlord' || user?.role === 'admin') && (
            <Link to="/listings/new"><Button><Plus size={16} />Novo Imóvel</Button></Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6 w-fit">
          {TABS.map((t) => {
            const Icon = TAB_ICONS[t.key as keyof typeof TAB_ICONS];
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.key ? 'bg-gold-500 text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={15} />{t.label}
              </button>
            );
          })}
        </div>

        {/* Saved listings */}
        {tab === 'saved' && (
          loadingSaved ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> :
          !saved?.length ? <Empty icon="❤️" title="Nenhum imóvel guardado" subtitle="Guarda os imóveis que mais gostas para os encontrar facilmente." /> :
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {saved.map((l: any) => <ListingCard key={l._id} listing={l} />)}
          </div>
        )}

        {/* Bookings */}
        {tab === 'bookings' && (
          loadingBookings ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> :
          !bookings?.length ? <Empty icon="📅" title="Nenhuma reserva" subtitle="As tuas reservas aparecerão aqui." /> :
          <div className="space-y-4">
            {bookings.map((b: any) => (
              <Card key={b._id} className="p-5">
                <div className="flex gap-4">
                  <img
                    src={b.listing?.images?.[0]?.url ?? 'https://placehold.co/80x60/1a1a2e/c9a84c?text=IMG'}
                    alt=""
                    className="w-20 h-16 object-cover rounded-xl shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Link to={`/listings/${b.listing?.slug}`} className="font-medium text-white hover:text-gold-400 text-sm truncate">
                        {b.listing?.title}
                      </Link>
                      <Badge variant={BOOKING_STATUS[b.status]?.variant}>{BOOKING_STATUS[b.status]?.label}</Badge>
                    </div>
                    <p className="text-gray-500 text-xs mb-2">
                      {new Date(b.startDate).toLocaleDateString('pt-AO')} → {new Date(b.endDate).toLocaleDateString('pt-AO')}
                    </p>
                    <p className="text-gold-400 font-semibold text-sm">{formatPrice(b.totalPrice, b.currency)}</p>
                  </div>
                </div>
                {b.status === 'pending' && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <Button variant="danger" size="sm" onClick={() => cancelBooking.mutate(b._id)}>
                      Cancelar Reserva
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* My Listings (landlord) */}
        {tab === 'myListings' && (
          loadingMy ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> :
          !myListings?.length ? (
            <Empty icon="🏠" title="Nenhum imóvel publicado">
              <Link to="/listings/new" className="mt-4 inline-block">
                <Button><Plus size={16} />Publicar primeiro imóvel</Button>
              </Link>
            </Empty>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myListings.map((l: any) => (
                <div key={l._id} className="relative group">
                  <ListingCard listing={l} />
                  <div className="absolute top-14 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Link to={`/listings/${l._id}/edit`}>
                      <Button size="sm" variant="secondary">Editar</Button>
                    </Link>
                    <Button size="sm" variant="danger" onClick={() => {
                      if (confirm('Eliminar este imóvel?')) deleteListingMut.mutate(l._id);
                    }}>
                      Apagar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
