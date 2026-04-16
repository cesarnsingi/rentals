import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Modal, ScrollView, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { COLORS, ANGOLA_CITIES, PROPERTY_TYPES, AMENITIES } from '../constants';
import { listingsApi } from '../lib/api';
import ListingCard from '../components/ListingCard';

export default function ListingsScreen() {
  const nav    = useNavigation<any>();
  const route  = useRoute<any>();
  const params = route.params ?? {};

  const [search,    setSearch]    = useState(params.search    ?? '');
  const [city,      setCity]      = useState(params.city      ?? '');
  const [type,      setType]      = useState(params.type      ?? '');
  const [minPrice,  setMinPrice]  = useState('');
  const [maxPrice,  setMaxPrice]  = useState('');
  const [bedrooms,  setBedrooms]  = useState('');
  const [furnished, setFurnished] = useState('');
  const [page,      setPage]      = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const queryParams = {
    search: search || undefined,
    city:   city   || undefined,
    type:   type   || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    bedrooms: bedrooms || undefined,
    furnished: furnished || undefined,
    page,
    limit: 10,
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['mobile-listings', queryParams],
    queryFn:  () => listingsApi.getAll(queryParams).then(r => r.data),
  });

  const listings    = data?.listings ?? [];
  const totalPages  = data?.totalPages ?? 1;

  return (
    <View style={styles.container}>
      {/* Search header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={COLORS.gray3} />
          <TextInput
            value={search}
            onChangeText={(t) => { setSearch(t); setPage(1); }}
            placeholder="Pesquisar imóveis..."
            placeholderTextColor={COLORS.gray3}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => { setSearch(''); setPage(1); }}>
              <Ionicons name="close-circle" size={16} color={COLORS.gray3} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilters(true)}>
          <Ionicons name="options-outline" size={20} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      {/* Active filters chips */}
      {(city || type || bedrooms || furnished) ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {city && <Chip label={city} onRemove={() => setCity('')} />}
          {type && <Chip label={PROPERTY_TYPES.find(t => t.value === type)?.label ?? type} onRemove={() => setType('')} />}
          {bedrooms && <Chip label={`${bedrooms}+ quartos`} onRemove={() => setBedrooms('')} />}
          {furnished && <Chip label={furnished === 'true' ? 'Mobilado' : 'Sem mobília'} onRemove={() => setFurnished('')} />}
        </ScrollView>
      ) : null}

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>
          {isLoading ? 'A pesquisar...' : `${data?.total ?? 0} imóveis encontrados`}
        </Text>
        {isFetching && !isLoading && <ActivityIndicator size="small" color={COLORS.gold} />}
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            onPress={() => nav.navigate('PropertyDetail', { slug: item.slug, title: item.title })}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🏠</Text>
              <Text style={styles.emptyTitle}>Nenhum imóvel encontrado</Text>
              <Text style={styles.emptyText}>Tenta ajustar os filtros</Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <ActivityIndicator size="large" color={COLORS.gold} />
            </View>
          )
        }
        ListFooterComponent={
          totalPages > 1 ? (
            <View style={styles.pagination}>
              <TouchableOpacity
                onPress={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
              >
                <Text style={styles.pageBtnText}>← Anterior</Text>
              </TouchableOpacity>
              <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
              <TouchableOpacity
                onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
              >
                <Text style={styles.pageBtnText}>Próximo →</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtros</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll} contentContainerStyle={{ paddingBottom: 40 }}>
            <FilterSection label="Cidade">
              <View style={styles.pillWrap}>
                <FilterPill label="Todas" active={!city} onPress={() => setCity('')} />
                {ANGOLA_CITIES.map(c => <FilterPill key={c} label={c} active={city === c} onPress={() => setCity(c)} />)}
              </View>
            </FilterSection>
            <FilterSection label="Tipo de imóvel">
              <View style={styles.pillWrap}>
                <FilterPill label="Todos" active={!type} onPress={() => setType('')} />
                {PROPERTY_TYPES.map(t => <FilterPill key={t.value} label={t.label} active={type === t.value} onPress={() => setType(t.value)} />)}
              </View>
            </FilterSection>
            <FilterSection label="Quartos mínimos">
              <View style={styles.pillWrap}>
                {['', '1', '2', '3', '4'].map(n => (
                  <FilterPill key={n} label={n ? `${n}+` : 'Todos'} active={bedrooms === n} onPress={() => setBedrooms(n)} />
                ))}
              </View>
            </FilterSection>
            <FilterSection label="Estado">
              <View style={styles.pillWrap}>
                {[{ v: '', l: 'Todos' }, { v: 'true', l: 'Mobilado' }, { v: 'false', l: 'Sem mobília' }].map(opt => (
                  <FilterPill key={opt.v} label={opt.l} active={furnished === opt.v} onPress={() => setFurnished(opt.v)} />
                ))}
              </View>
            </FilterSection>
            <FilterSection label="Preço (AOA)">
              <View style={styles.priceRow}>
                <TextInput value={minPrice} onChangeText={setMinPrice} placeholder="Mín" placeholderTextColor={COLORS.gray3} keyboardType="numeric" style={styles.priceInput} />
                <Text style={{ color: COLORS.gray3 }}>—</Text>
                <TextInput value={maxPrice} onChangeText={setMaxPrice} placeholder="Máx" placeholderTextColor={COLORS.gray3} keyboardType="numeric" style={styles.priceInput} />
              </View>
            </FilterSection>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.resetBtn} onPress={() => { setCity(''); setType(''); setBedrooms(''); setFurnished(''); setMinPrice(''); setMaxPrice(''); }}>
              <Text style={styles.resetBtnText}>Limpar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={() => { setPage(1); setShowFilters(false); }}>
              <Text style={styles.applyBtnText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <TouchableOpacity style={styles.chip} onPress={onRemove}>
      <Text style={styles.chipText}>{label}</Text>
      <Ionicons name="close" size={12} color={COLORS.gold} />
    </TouchableOpacity>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.filterPill, active && styles.filterPillActive]} onPress={onPress}>
      <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.bg },
  searchHeader:   { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12 },
  searchBox:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.bg1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11 },
  searchInput:    { flex: 1, color: COLORS.white, fontSize: 14 },
  filterBtn:      { width: 46, height: 46, backgroundColor: COLORS.bg1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  chipsRow:       { marginBottom: 8 },
  chip:           { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.goldBg, borderWidth: 1, borderColor: COLORS.gold, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  chipText:       { fontSize: 12, color: COLORS.gold, fontWeight: '500' },
  resultsRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 },
  resultsText:    { fontSize: 13, color: COLORS.gray3 },
  list:           { paddingHorizontal: 16, paddingBottom: 24 },
  empty:          { alignItems: 'center', paddingTop: 80 },
  emptyEmoji:     { fontSize: 48, marginBottom: 12 },
  emptyTitle:     { fontSize: 17, fontWeight: '600', color: COLORS.white, marginBottom: 6 },
  emptyText:      { fontSize: 13, color: COLORS.gray3 },
  pagination:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  pageBtn:        { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: COLORS.bg1, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
  pageBtnDisabled:{ opacity: 0.4 },
  pageBtnText:    { color: COLORS.gray2, fontSize: 13, fontWeight: '500' },
  pageInfo:       { color: COLORS.gray3, fontSize: 13 },
  // Modal
  modalContainer: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle:     { fontSize: 18, fontWeight: '700', color: COLORS.white },
  modalScroll:    { flex: 1 },
  modalFooter:    { flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: COLORS.border },
  filterSection:  { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filterSectionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.gray2, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  pillWrap:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterPill:     { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg1 },
  filterPillActive: { backgroundColor: COLORS.goldBg, borderColor: COLORS.gold },
  filterPillText: { fontSize: 13, color: COLORS.gray2, fontWeight: '500' },
  filterPillTextActive: { color: COLORS.gold },
  priceRow:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  priceInput:     { flex: 1, backgroundColor: COLORS.bg1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: COLORS.white, fontSize: 14 },
  resetBtn:       { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  resetBtnText:   { color: COLORS.gray2, fontWeight: '600' },
  applyBtn:       { flex: 2, paddingVertical: 14, borderRadius: 14, backgroundColor: COLORS.gold, alignItems: 'center' },
  applyBtnText:   { color: COLORS.bg, fontWeight: '700', fontSize: 15 },
});
