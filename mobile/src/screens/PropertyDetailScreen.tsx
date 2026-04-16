import React, { useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, Linking, Alert, Dimensions, Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { COLORS, formatPrice, formatPeriod, getWhatsAppUrl } from '../constants';
import { listingsApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';

const { width } = Dimensions.get('window');

export default function PropertyDetailScreen() {
  const route  = useRoute<any>();
  const nav    = useNavigation<any>();
  const { slug } = route.params;
  const { isAuth } = useAuthStore();
  const [imgIdx, setImgIdx]   = useState(0);
  const [expanded, setExpanded] = useState(false);

  const { data: listing, isLoading } = useQuery({
    queryKey: ['mobile-listing', slug],
    queryFn:  () => listingsApi.getOne(slug).then(r => r.data),
  });

  if (isLoading || !listing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>A carregar...</Text>
      </View>
    );
  }

  const images  = listing.images?.length ? listing.images : [{ url: `https://placehold.co/800x600/1a1a24/c9a84c?text=${listing.location?.city}` }];
  const landlord = typeof listing.landlord === 'object' ? listing.landlord : null;

  const handleWhatsApp = () => {
    if (!listing.contactWhatsApp) return;
    const url = getWhatsAppUrl(listing.contactWhatsApp, `Olá! Tenho interesse no imóvel: ${listing.title}`);
    Linking.openURL(url);
  };

  const handleCall = () => {
    if (!listing.contactPhone) return;
    Linking.openURL(`tel:${listing.contactPhone}`);
  };

  const handleMap = () => {
    if (!listing.location?.coordinates?.lat) return;
    const { lat, lng } = listing.location.coordinates;
    const url = Platform.OS === 'ios'
      ? `maps:?q=${lat},${lng}`
      : `geo:${lat},${lng}?q=${lat},${lng}`;
    Linking.openURL(url).catch(() => Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`));
  };

  const TYPE_LABELS: Record<string, string> = {
    apartment: 'Apartamento', house: 'Casa', villa: 'Vivenda',
    studio: 'Studio', commercial: 'Comercial', room: 'Quarto',
  };

  return (
    <View style={styles.container}>
      {/* Back button absolute overlay */}
      <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
        <Ionicons name="arrow-back" size={22} color={COLORS.white} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Image carousel */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => setImgIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
          scrollEventThrottle={16}
        >
          {images.map((img: any, i: number) => (
            <Image key={i} source={{ uri: img.url }} style={styles.image} resizeMode="cover" />
          ))}
        </ScrollView>

        {/* Dot indicators */}
        {images.length > 1 && (
          <View style={styles.dots}>
            {images.map((_: any, i: number) => (
              <View key={i} style={[styles.dot, i === imgIdx && styles.dotActive]} />
            ))}
          </View>
        )}

        <View style={styles.content}>
          {/* Price + type */}
          <View style={styles.row}>
            <View>
              <View style={styles.row}>
                <Text style={styles.price}>{formatPrice(listing.price, listing.currency)}</Text>
                <Text style={styles.period}>{formatPeriod(listing.pricePeriod)}</Text>
              </View>
              {listing.featured && (
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={10} color={COLORS.bg} />
                  <Text style={styles.featuredText}>Em Destaque</Text>
                </View>
              )}
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{TYPE_LABELS[listing.type] ?? listing.type}</Text>
            </View>
          </View>

          <Text style={styles.title}>{listing.title}</Text>

          <View style={[styles.row, { marginTop: 6 }]}>
            <Ionicons name="location-outline" size={14} color={COLORS.gold} />
            <Text style={styles.address}>{listing.location?.address}, {listing.location?.city}</Text>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {listing.bedrooms > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="bed-outline" size={22} color={COLORS.gold} />
                <Text style={styles.statValue}>{listing.bedrooms}</Text>
                <Text style={styles.statLabel}>Quartos</Text>
              </View>
            )}
            <View style={styles.statItem}>
              <Ionicons name="water-outline" size={22} color={COLORS.gold} />
              <Text style={styles.statValue}>{listing.bathrooms}</Text>
              <Text style={styles.statLabel}>WC</Text>
            </View>
            {listing.area > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="resize-outline" size={22} color={COLORS.gold} />
                <Text style={styles.statValue}>{listing.area}m²</Text>
                <Text style={styles.statLabel}>Área</Text>
              </View>
            )}
            <View style={styles.statItem}>
              <Ionicons name={listing.furnished ? 'checkmark-circle' : 'close-circle'} size={22} color={listing.furnished ? COLORS.green : COLORS.gray3} />
              <Text style={styles.statValue}>{listing.furnished ? 'Sim' : 'Não'}</Text>
              <Text style={styles.statLabel}>Mobilado</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.description} numberOfLines={expanded ? undefined : 4}>
              {listing.description}
            </Text>
            {listing.description?.length > 200 && (
              <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                <Text style={styles.readMore}>{expanded ? 'Ver menos ↑' : 'Ver mais ↓'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Amenities */}
          {listing.amenities?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Comodidades</Text>
              <View style={styles.amenitiesGrid}>
                {listing.amenities.map((a: string) => (
                  <View key={a} style={styles.amenityItem}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.gold} />
                    <Text style={styles.amenityText}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Map button */}
          {listing.location?.coordinates?.lat && (
            <TouchableOpacity style={styles.mapBtn} onPress={handleMap}>
              <Ionicons name="map-outline" size={18} color={COLORS.gold} />
              <Text style={styles.mapBtnText}>Ver no mapa — {listing.location?.city}</Text>
              <Ionicons name="open-outline" size={14} color={COLORS.gray3} />
            </TouchableOpacity>
          )}

          {/* Landlord */}
          {landlord && (
            <View style={styles.landlordCard}>
              <Text style={styles.sectionTitle}>Proprietário</Text>
              <View style={styles.landlordRow}>
                <View style={styles.landlordAvatar}>
                  <Text style={styles.landlordInitial}>{landlord.name?.[0]?.toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.landlordName}>{landlord.name}</Text>
                  <Text style={styles.landlordBadge}>✓ Proprietário verificado</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Contact bar */}
      <View style={styles.contactBar}>
        {listing.contactWhatsApp && (
          <TouchableOpacity style={styles.waBtn} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={styles.waBtnText}>WhatsApp</Text>
          </TouchableOpacity>
        )}
        {listing.contactPhone && (
          <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
            <Ionicons name="call-outline" size={20} color={COLORS.gold} />
            <Text style={styles.callBtnText}>Ligar</Text>
          </TouchableOpacity>
        )}
        {isAuth() && (
          <TouchableOpacity style={styles.bookBtn} onPress={() => nav.navigate('Booking', { listingId: listing._id, title: listing.title })}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.bg} />
            <Text style={styles.bookBtnText}>Reservar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer:   { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  loadingText:        { color: COLORS.gray3, fontSize: 16 },
  backBtn:            { position: 'absolute', top: 48, left: 16, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  image:              { width, height: 280, backgroundColor: COLORS.bg2 },
  dots:               { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  dot:                { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.border },
  dotActive:          { backgroundColor: COLORS.gold, width: 18 },
  content:            { padding: 20 },
  row:                { flexDirection: 'row', alignItems: 'center', gap: 8 },
  price:              { fontSize: 26, fontWeight: '800', color: COLORS.gold },
  period:             { fontSize: 13, color: COLORS.gray3 },
  featuredBadge:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.gold, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginTop: 6, alignSelf: 'flex-start' },
  featuredText:       { color: COLORS.bg, fontSize: 10, fontWeight: '700' },
  typeBadge:          { marginLeft: 'auto', backgroundColor: COLORS.bg2, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  typeText:           { color: COLORS.gray2, fontSize: 12, fontWeight: '500' },
  title:              { fontSize: 20, fontWeight: '700', color: COLORS.white, marginTop: 10, lineHeight: 28 },
  address:            { fontSize: 13, color: COLORS.gray3, flex: 1 },
  statsRow:           { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.bg1, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginTop: 16 },
  statItem:           { alignItems: 'center', gap: 4 },
  statValue:          { fontSize: 14, fontWeight: '700', color: COLORS.white },
  statLabel:          { fontSize: 11, color: COLORS.gray3 },
  section:            { marginTop: 24 },
  sectionTitle:       { fontSize: 16, fontWeight: '700', color: COLORS.white, marginBottom: 12 },
  description:        { fontSize: 14, color: COLORS.gray2, lineHeight: 22 },
  readMore:           { color: COLORS.gold, fontSize: 13, fontWeight: '500', marginTop: 8 },
  amenitiesGrid:      { gap: 10 },
  amenityItem:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amenityText:        { fontSize: 14, color: COLORS.gray2 },
  mapBtn:             { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.bg1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 14, marginTop: 16 },
  mapBtnText:         { flex: 1, fontSize: 14, color: COLORS.gray1, fontWeight: '500' },
  landlordCard:       { marginTop: 24, backgroundColor: COLORS.bg1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 16 },
  landlordRow:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  landlordAvatar:     { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.goldBg, borderWidth: 2, borderColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  landlordInitial:    { fontSize: 18, fontWeight: '700', color: COLORS.gold },
  landlordName:       { fontSize: 15, fontWeight: '600', color: COLORS.white },
  landlordBadge:      { fontSize: 12, color: COLORS.green, marginTop: 2 },
  contactBar:         { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 10, padding: 16, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border },
  waBtn:              { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#25d366', borderRadius: 14, paddingVertical: 14 },
  waBtnText:          { color: '#fff', fontWeight: '700', fontSize: 15 },
  callBtn:            { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.bg1, borderWidth: 1, borderColor: COLORS.gold, borderRadius: 14, paddingVertical: 14 },
  callBtnText:        { color: COLORS.gold, fontWeight: '600', fontSize: 14 },
  bookBtn:            { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.gold, borderRadius: 14, paddingVertical: 14 },
  bookBtnText:        { color: COLORS.bg, fontWeight: '700', fontSize: 14 },
});
