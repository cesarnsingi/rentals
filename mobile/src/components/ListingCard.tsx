import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, formatPrice, formatPeriod } from '../constants';
import { listingsApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';

interface Props {
  listing:   any;
  onPress:   () => void;
  onSaveChange?: (id: string, saved: boolean) => void;
  horizontal?: boolean;
}

export default function ListingCard({ listing, onPress, onSaveChange, horizontal }: Props) {
  const { user, isAuth } = useAuthStore();
  const isSaved = user?.savedListings?.includes(listing._id);
  const [saved, setSaved] = useState(isSaved ?? false);

  const thumb = listing.images?.[0]?.url
    ?? `https://placehold.co/400x300/1a1a24/c9a84c?text=${encodeURIComponent(listing.location?.city ?? 'AR')}`;

  const handleSave = async () => {
    if (!isAuth()) { Alert.alert('Sessão necessária', 'Inicia sessão para guardar imóveis'); return; }
    try {
      const { data } = await listingsApi.save(listing._id);
      setSaved(data.saved);
      onSaveChange?.(listing._id, data.saved);
    } catch { Alert.alert('Erro', 'Não foi possível guardar'); }
  };

  const TYPE_LABELS: Record<string, string> = {
    apartment: 'Apt.', house: 'Casa', villa: 'Vivenda',
    studio: 'Studio', commercial: 'Comercial', room: 'Quarto',
  };

  if (horizontal) {
    return (
      <TouchableOpacity style={styles.hCard} onPress={onPress} activeOpacity={0.85}>
        <Image source={{ uri: thumb }} style={styles.hImage} />
        <View style={styles.hContent}>
          <Text style={styles.hPrice}>
            {formatPrice(listing.price, listing.currency)}
            <Text style={styles.hPeriod}>{formatPeriod(listing.pricePeriod)}</Text>
          </Text>
          <Text style={styles.hTitle} numberOfLines={2}>{listing.title}</Text>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={11} color={COLORS.gold} />
            <Text style={styles.hCity}>{listing.location?.city}</Text>
          </View>
          <View style={styles.hStats}>
            {listing.bedrooms > 0 && (
              <View style={styles.statChip}><Ionicons name="bed-outline" size={11} color={COLORS.gray2} /><Text style={styles.statText}>{listing.bedrooms}</Text></View>
            )}
            <View style={styles.statChip}><Ionicons name="water-outline" size={11} color={COLORS.gray2} /><Text style={styles.statText}>{listing.bathrooms}</Text></View>
            {listing.area > 0 && (
              <View style={styles.statChip}><Ionicons name="resize-outline" size={11} color={COLORS.gray2} /><Text style={styles.statText}>{listing.area}m²</Text></View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: thumb }} style={styles.image} />
        <View style={styles.imageOverlay} />

        {listing.featured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={10} color={COLORS.bg} />
            <Text style={styles.featuredText}>Destaque</Text>
          </View>
        )}

        <TouchableOpacity style={[styles.saveBtn, saved && styles.saveBtnActive]} onPress={handleSave}>
          <Ionicons name={saved ? 'heart' : 'heart-outline'} size={16} color={saved ? '#fff' : '#fff'} />
        </TouchableOpacity>

        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{TYPE_LABELS[listing.type] ?? listing.type}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.price}>{formatPrice(listing.price, listing.currency)}</Text>
          <Text style={styles.period}>{formatPeriod(listing.pricePeriod)}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>
        <View style={[styles.row, { marginTop: 4 }]}>
          <Ionicons name="location-outline" size={12} color={COLORS.gold} />
          <Text style={styles.location}>
            {listing.location?.district ? `${listing.location.district}, ` : ''}{listing.location?.city}
          </Text>
        </View>
        <View style={[styles.row, { marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 }]}>
          {listing.bedrooms > 0 && (
            <View style={styles.statChip}><Ionicons name="bed-outline" size={13} color={COLORS.gray2} /><Text style={styles.statText}>{listing.bedrooms} Qt.</Text></View>
          )}
          <View style={styles.statChip}><Ionicons name="water-outline" size={13} color={COLORS.gray2} /><Text style={styles.statText}>{listing.bathrooms} WC</Text></View>
          {listing.area > 0 && (
            <View style={styles.statChip}><Ionicons name="resize-outline" size={13} color={COLORS.gray2} /><Text style={styles.statText}>{listing.area}m²</Text></View>
          )}
          {listing.furnished && (
            <View style={[styles.statChip, styles.furnishedChip]}>
              <Text style={styles.furnishedText}>Mobilado</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:           { backgroundColor: COLORS.bg1, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', marginBottom: 16 },
  imageWrap:      { position: 'relative' },
  image:          { width: '100%', height: 200, backgroundColor: COLORS.bg2 },
  imageOverlay:   { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'transparent' },
  featuredBadge:  { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.gold, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  featuredText:   { color: COLORS.bg, fontSize: 10, fontWeight: '700' },
  saveBtn:        { position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  saveBtnActive:  { backgroundColor: '#ef4444' },
  typeBadge:      { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typeText:       { color: '#fff', fontSize: 10, fontWeight: '600' },
  content:        { padding: 14 },
  row:            { flexDirection: 'row', alignItems: 'center', gap: 4 },
  price:          { fontSize: 20, fontWeight: '800', color: COLORS.gold },
  period:         { fontSize: 12, color: COLORS.gray3, marginTop: 2 },
  title:          { fontSize: 14, fontWeight: '600', color: COLORS.white, marginTop: 4, lineHeight: 20 },
  location:       { fontSize: 12, color: COLORS.gray3, flex: 1 },
  statChip:       { flexDirection: 'row', alignItems: 'center', gap: 3, marginRight: 10 },
  statText:       { fontSize: 12, color: COLORS.gray2 },
  furnishedChip:  { backgroundColor: '#052e16', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  furnishedText:  { fontSize: 11, color: COLORS.green, fontWeight: '600' },
  // Horizontal card
  hCard:    { flexDirection: 'row', backgroundColor: COLORS.bg1, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', marginBottom: 12, height: 100 },
  hImage:   { width: 120, height: '100%', backgroundColor: COLORS.bg2 },
  hContent: { flex: 1, padding: 12, justifyContent: 'space-between' },
  hPrice:   { fontSize: 16, fontWeight: '800', color: COLORS.gold },
  hPeriod:  { fontSize: 11, color: COLORS.gray3, fontWeight: '400' },
  hTitle:   { fontSize: 12, color: COLORS.white, lineHeight: 17 },
  hCity:    { fontSize: 11, color: COLORS.gray3 },
  hStats:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
