import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Maximize, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Listing } from '../../types';
import { formatPrice, formatPricePeriod } from '../../lib/utils';
import { listingsApi } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';
import { Badge } from '../ui';
import toast from 'react-hot-toast';

interface Props {
  listing:   Listing;
  onSaveToggle?: (id: string, saved: boolean) => void;
}

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartamento', house: 'Casa', villa: 'Vivenda',
  studio: 'Studio', commercial: 'Comercial', room: 'Quarto',
};

export default function ListingCard({ listing, onSaveToggle }: Props) {
  const { user, isAuth } = useAuthStore();
  const isSaved = user?.savedListings?.includes(listing._id);
  const [saved, setSaved] = useState(isSaved ?? false);
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuth()) { toast.error('Inicia sessão para guardar'); return; }
    setSaving(true);
    try {
      const { data } = await listingsApi.save(listing._id);
      setSaved(data.saved);
      onSaveToggle?.(listing._id, data.saved);
    } catch {
      toast.error('Erro ao guardar');
    } finally {
      setSaving(false);
    }
  };

  const thumb = !imgError && listing.images[0]?.url
    ? listing.images[0].url
    : `https://placehold.co/600x400/1a1a2e/c9a84c?text=${encodeURIComponent(listing.location.city)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/listings/${listing.slug}`} className="block group">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:shadow-black/40">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-800">
            <img
              src={thumb}
              alt={listing.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {listing.featured && (
              <div className="absolute top-3 left-3">
                <Badge variant="gold"><Star size={10} className="mr-1" />Destaque</Badge>
              </div>
            )}

            <div className="absolute top-3 right-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`w-9 h-9 rounded-full backdrop-blur-sm border transition-all flex items-center justify-center ${
                  saved ? 'bg-red-500/90 border-red-400' : 'bg-black/50 border-white/20 hover:bg-black/70'
                }`}
              >
                <Heart size={16} className={saved ? 'text-white fill-white' : 'text-white'} />
              </button>
            </div>

            <div className="absolute bottom-3 left-3">
              <Badge variant="gray" className="backdrop-blur-sm">{TYPE_LABELS[listing.type]}</Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Price */}
            <div className="flex items-baseline gap-1 mb-1.5">
              <span className="text-xl font-bold text-gold-400">{formatPrice(listing.price, listing.currency)}</span>
              <span className="text-sm text-gray-500">{formatPricePeriod(listing.pricePeriod)}</span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-white text-sm mb-1.5 line-clamp-2 group-hover:text-gold-300 transition-colors">
              {listing.title}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
              <MapPin size={12} />
              <span>{listing.location.district && `${listing.location.district}, `}{listing.location.city}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-gray-400 text-xs border-t border-gray-800 pt-3">
              {listing.bedrooms > 0 && (
                <div className="flex items-center gap-1">
                  <Bed size={13} /><span>{listing.bedrooms} Qt.</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Bath size={13} /><span>{listing.bathrooms} WC</span>
              </div>
              {listing.area > 0 && (
                <div className="flex items-center gap-1">
                  <Maximize size={13} /><span>{listing.area} m²</span>
                </div>
              )}
              {listing.furnished && (
                <Badge variant="green" className="ml-auto">Mobilado</Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
