import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  MapPin, Bed, Bath, Maximize, Heart, Phone, MessageCircle,
  Mail, Check, ChevronLeft, ChevronRight, Star, Eye, Calendar,
} from 'lucide-react';
import { listingsApi, bookingsApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import { formatPrice, formatPricePeriod, getWhatsAppUrl, AMENITIES } from '../lib/utils';
import { Button, Badge, Card, Spinner, Modal } from '../components/ui';
import toast from 'react-hot-toast';

export default function PropertyDetailPage() {
  const { slug }          = useParams<{ slug: string }>();
  const { user, isAuth }  = useAuthStore();
  const [imgIdx, setImgIdx]       = useState(0);
  const [showBooking, setShowBooking] = useState(false);
  const [bookForm, setBookForm]   = useState({ startDate: '', endDate: '', message: '' });

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', slug],
    queryFn:  () => listingsApi.getOne(slug!).then((r) => r.data),
    enabled:  !!slug,
  });

  const bookMutation = useMutation({
    mutationFn: () => bookingsApi.create({
      listingId: listing?._id,
      ...bookForm,
    }),
    onSuccess: () => {
      toast.success('Pedido de reserva enviado!');
      setShowBooking(false);
    },
    onError: () => toast.error('Erro ao enviar reserva'),
  });

  if (isLoading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  if (!listing) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 text-xl mb-4">Imóvel não encontrado</p>
        <Link to="/listings"><Button>Ver todos os imóveis</Button></Link>
      </div>
    </div>
  );

  const images = listing.images.length > 0 ? listing.images : [{ url: 'https://placehold.co/1200x800/1a1a2e/c9a84c?text=Sem+Imagem', publicId: '' }];
  const landlord = typeof listing.landlord === 'object' ? listing.landlord : null;
  const waUrl = listing.contactWhatsApp
    ? getWhatsAppUrl(listing.contactWhatsApp, `Olá! Tenho interesse no imóvel: ${listing.title} - ${window.location.href}`)
    : null;

  const TYPE_LABELS: Record<string, string> = {
    apartment: 'Apartamento', house: 'Casa', villa: 'Vivenda',
    studio: 'Studio', commercial: 'Comercial', room: 'Quarto',
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-white">Início</Link>
          <span>/</span>
          <Link to="/listings" className="hover:text-white">Imóveis</Link>
          <span>/</span>
          <span className="text-gray-300 truncate">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left (main content) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Image Gallery */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-gray-800 group">
              <img
                src={images[imgIdx]?.url}
                alt={listing.title}
                className="w-full h-full object-cover"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx((p) => (p - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setImgIdx((p) => (p + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                    {imgIdx + 1} / {images.length}
                  </div>
                </>
              )}

              {listing.featured && (
                <div className="absolute top-3 left-3">
                  <Badge variant="gold"><Star size={10} className="mr-1" />Em Destaque</Badge>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === imgIdx ? 'border-gold-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Title + Meta */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-2xl font-bold text-white">{listing.title}</h1>
                <Badge variant="gray">{TYPE_LABELS[listing.type]}</Badge>
              </div>

              <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                <MapPin size={14} className="text-gold-400" />
                <span>{listing.location.address}, {listing.location.district && `${listing.location.district}, `}{listing.location.city}</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Eye size={13} />{listing.viewCount} visualizações</span>
                <span className="flex items-center gap-1"><Calendar size={13} />
                  {new Date(listing.createdAt).toLocaleDateString('pt-AO')}
                </span>
              </div>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Quartos', value: listing.bedrooms || '—', icon: <Bed size={18} /> },
                { label: 'WC', value: listing.bathrooms, icon: <Bath size={18} /> },
                { label: 'Área', value: listing.area ? `${listing.area} m²` : '—', icon: <Maximize size={18} /> },
                { label: 'Estado', value: listing.furnished ? 'Mobilado' : 'Sem mobília', icon: <Check size={18} /> },
              ].map((s) => (
                <Card key={s.label} className="p-4 text-center">
                  <div className="text-gold-400 flex justify-center mb-1">{s.icon}</div>
                  <div className="text-white font-semibold text-sm">{s.value}</div>
                  <div className="text-gray-500 text-xs">{s.label}</div>
                </Card>
              ))}
            </div>

            {/* Description */}
            <Card className="p-5">
              <h2 className="font-semibold text-white mb-3">Descrição</h2>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </Card>

            {/* Amenities */}
            {listing.amenities.length > 0 && (
              <Card className="p-5">
                <h2 className="font-semibold text-white mb-4">Comodidades</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {listing.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-5 h-5 bg-gold-500/20 rounded-full flex items-center justify-center shrink-0">
                        <Check size={11} className="text-gold-400" />
                      </div>
                      {a}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Map placeholder */}
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h2 className="font-semibold text-white">Localização</h2>
                <p className="text-gray-500 text-sm mt-0.5">{listing.location.address}, {listing.location.city}</p>
              </div>
              {listing.location.coordinates?.lat ? (
                <div className="h-56 bg-gray-800 flex items-center justify-center">
                  <a
                    href={`https://www.google.com/maps?q=${listing.location.coordinates.lat},${listing.location.coordinates.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-gold-400 hover:text-gold-300 text-sm"
                  >
                    <MapPin size={18} /> Ver no Google Maps
                  </a>
                </div>
              ) : (
                <div className="h-32 bg-gray-800 flex items-center justify-center text-gray-600 text-sm">
                  Mapa não disponível
                </div>
              )}
            </Card>
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-4">

            {/* Price card */}
            <Card className="p-5 sticky top-20">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-gold-400">{formatPrice(listing.price, listing.currency)}</span>
                <span className="text-gray-500">{formatPricePeriod(listing.pricePeriod)}</span>
              </div>
              {listing.currency === 'USD' && <p className="text-xs text-gray-600 mb-4">≈ {formatPrice(listing.price * 850, 'AOA')}/mês</p>}

              <div className="space-y-2 mb-5">
                {waUrl && (
                  <a href={waUrl} target="_blank" rel="noreferrer" className="block">
                    <Button className="w-full bg-green-600 hover:bg-green-500 text-white">
                      <MessageCircle size={16} /> WhatsApp
                    </Button>
                  </a>
                )}
                {listing.contactPhone && (
                  <a href={`tel:${listing.contactPhone}`} className="block">
                    <Button variant="secondary" className="w-full">
                      <Phone size={16} /> Ligar
                    </Button>
                  </a>
                )}
                {isAuth() && (
                  <Button variant="outline" className="w-full" onClick={() => setShowBooking(true)}>
                    <Calendar size={16} /> Pedir Visita
                  </Button>
                )}
                {listing.contactEmail && (
                  <a href={`mailto:${listing.contactEmail}?subject=Interesse: ${listing.title}`} className="block">
                    <Button variant="ghost" className="w-full">
                      <Mail size={16} /> Email
                    </Button>
                  </a>
                )}
              </div>

              <p className="text-xs text-gray-600 text-center">Ref: {listing._id.slice(-8).toUpperCase()}</p>
            </Card>

            {/* Landlord card */}
            {landlord && (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Proprietário</h3>
                <div className="flex items-center gap-3">
                  <img
                    src={landlord.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(landlord.name)}&background=c9a84c&color=000`}
                    alt={landlord.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-white text-sm">{landlord.name}</p>
                    <p className="text-xs text-gray-500">Proprietário verificado</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal open={showBooking} onClose={() => setShowBooking(false)} title="Pedir Visita / Reserva">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 block mb-1.5">Data de início</label>
            <input type="date" value={bookForm.startDate} min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setBookForm((p) => ({ ...p, startDate: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500" />
          </div>
          <div>
            <label className="text-sm text-gray-300 block mb-1.5">Data de fim</label>
            <input type="date" value={bookForm.endDate} min={bookForm.startDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => setBookForm((p) => ({ ...p, endDate: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500" />
          </div>
          <div>
            <label className="text-sm text-gray-300 block mb-1.5">Mensagem (opcional)</label>
            <textarea rows={3} value={bookForm.message}
              onChange={(e) => setBookForm((p) => ({ ...p, message: e.target.value }))}
              placeholder="Adiciona uma mensagem ao proprietário..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500 resize-none" />
          </div>
          <Button
            className="w-full"
            loading={bookMutation.isPending}
            onClick={() => bookMutation.mutate()}
            disabled={!bookForm.startDate || !bookForm.endDate}
          >
            Enviar Pedido
          </Button>
        </div>
      </Modal>
    </div>
  );
}
