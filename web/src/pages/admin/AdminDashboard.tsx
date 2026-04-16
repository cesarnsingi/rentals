import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { Users, Home, Calendar, TrendingUp, Star, Trash2, Check } from 'lucide-react';
import { adminApi } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';
import { Badge, Button, Card, Spinner } from '../../components/ui';
import { formatPrice } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, isAuth } = useAuthStore();
  const [tab, setTab]    = useState<'overview' | 'listings' | 'users'>('overview');
  const qc               = useQueryClient();

  if (!isAuth() || user?.role !== 'admin') return <Navigate to="/" />;

  const { data: dash } = useQuery({
    queryKey: ['admin-dash'],
    queryFn:  () => adminApi.dashboard().then((r) => r.data),
  });

  const { data: listings, isLoading: loadListings } = useQuery({
    queryKey: ['admin-listings'],
    queryFn:  () => adminApi.listings({ limit: 50 }).then((r) => r.data),
    enabled:  tab === 'listings',
  });

  const { data: users, isLoading: loadUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn:  () => adminApi.users({ limit: 50 }).then((r) => r.data),
    enabled:  tab === 'users',
  });

  const featureMut = useMutation({
    mutationFn: ({ id, days }: { id: string; days: number }) => adminApi.featureListing(id, days),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-listings'] }); toast.success('Imóvel destacado!'); },
  });

  const deleteUserMut = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Utilizador eliminado'); },
  });

  const STAT_CARDS = [
    { label: 'Utilizadores',   value: dash?.totalUsers,    icon: <Users size={20} />,     color: 'text-blue-400'  },
    { label: 'Imóveis',        value: dash?.totalListings, icon: <Home size={20} />,      color: 'text-green-400' },
    { label: 'Reservas',       value: dash?.totalBookings, icon: <Calendar size={20} />,  color: 'text-gold-400'  },
    { label: 'Pendentes',      value: dash?.pendingListings, icon: <TrendingUp size={20} />, color: 'text-red-400' },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Painel de Administração</h1>
          <p className="text-gray-500 text-sm mt-1">Gestão da plataforma Angola Rentals</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-8 w-fit">
          {[
            { key: 'overview', label: 'Visão Geral' },
            { key: 'listings', label: 'Imóveis' },
            { key: 'users',    label: 'Utilizadores' },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key ? 'bg-gold-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >{t.label}</button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {STAT_CARDS.map((s) => (
                <Card key={s.label} className="p-5">
                  <div className={`${s.color} mb-3`}>{s.icon}</div>
                  <div className="text-2xl font-bold text-white mb-1">{s.value ?? '—'}</div>
                  <div className="text-gray-500 text-sm">{s.label}</div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-5">
                <h2 className="font-semibold text-white mb-4">Imóveis Recentes</h2>
                <div className="space-y-3">
                  {dash?.recentListings?.map((l: any) => (
                    <div key={l._id} className="flex items-center gap-3">
                      <img src={l.images?.[0]?.url ?? 'https://placehold.co/40x40/1a1a2e/c9a84c?text=IMG'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{l.title}</p>
                        <p className="text-xs text-gray-500">{l.location?.city} · {l.landlord?.name}</p>
                      </div>
                      <Badge variant={l.status === 'available' ? 'green' : 'gray'}>{l.status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <h2 className="font-semibold text-white mb-4">Reservas Recentes</h2>
                <div className="space-y-3">
                  {dash?.recentBookings?.map((b: any) => (
                    <div key={b._id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">{b.listing?.title}</p>
                        <p className="text-xs text-gray-500">{b.tenant?.name}</p>
                      </div>
                      <Badge variant={b.status === 'confirmed' ? 'green' : b.status === 'pending' ? 'gold' : 'gray'}>
                        {b.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Listings */}
        {tab === 'listings' && (
          loadListings ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> :
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase">
                  <th className="text-left py-3 px-4">Imóvel</th>
                  <th className="text-left py-3 px-4">Cidade</th>
                  <th className="text-left py-3 px-4">Preço</th>
                  <th className="text-left py-3 px-4">Estado</th>
                  <th className="text-left py-3 px-4">Proprietário</th>
                  <th className="text-left py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {listings?.listings?.map((l: any) => (
                  <tr key={l._id} className="border-b border-gray-900 hover:bg-gray-900/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={l.images?.[0]?.url ?? 'https://placehold.co/40x30'} alt="" className="w-10 h-8 rounded object-cover" />
                        <span className="text-white max-w-[180px] truncate">{l.title}</span>
                        {l.featured && <Star size={12} className="text-gold-400 shrink-0" />}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{l.location?.city}</td>
                    <td className="py-3 px-4 text-gold-400 font-medium">{formatPrice(l.price, l.currency)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={l.status === 'available' ? 'green' : l.status === 'pending' ? 'gold' : 'gray'}>{l.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{l.landlord?.name}</td>
                    <td className="py-3 px-4">
                      {!l.featured && (
                        <Button size="sm" variant="ghost" onClick={() => featureMut.mutate({ id: l._id, days: 7 })}>
                          <Star size={13} />Destacar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          loadUsers ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> :
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase">
                  <th className="text-left py-3 px-4">Utilizador</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Papel</th>
                  <th className="text-left py-3 px-4">Registado</th>
                  <th className="text-left py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users?.users?.map((u: any) => (
                  <tr key={u._id} className="border-b border-gray-900 hover:bg-gray-900/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <img src={u.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&size=32&background=c9a84c&color=000`} alt="" className="w-8 h-8 rounded-full" />
                        <span className="text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{u.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant={u.role === 'admin' ? 'gold' : u.role === 'landlord' ? 'blue' : 'gray'}>{u.role}</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString('pt-AO')}</td>
                    <td className="py-3 px-4">
                      {u.role !== 'admin' && (
                        <Button size="sm" variant="danger" onClick={() => {
                          if (confirm(`Eliminar ${u.name}?`)) deleteUserMut.mutate(u._id);
                        }}>
                          <Trash2 size={13} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
