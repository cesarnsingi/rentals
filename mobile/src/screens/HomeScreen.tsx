import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { COLORS, ANGOLA_CITIES, PROPERTY_TYPES } from '../constants';
import { listingsApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import ListingCard from '../components/ListingCard';

export default function HomeScreen() {
  const nav                 = useNavigation<any>();
  const { user }            = useAuthStore();
  const [search, setSearch] = useState('');
  const [city, setCity]     = useState('');

  const { data: featured, isLoading: loadFeatured } = useQuery({
    queryKey: ['mobile-featured'],
    queryFn:  () => listingsApi.getAll({ featured: true, limit: 6 }).then(r => r.data),
  });

  const { data: recent } = useQuery({
    queryKey: ['mobile-recent'],
    queryFn:  () => listingsApi.getAll({ sort: '-createdAt', limit: 8 }).then(r => r.data),
  });

  const doSearch = () => {
    nav.navigate('Listings', { search, city });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {user ? `Olá, ${user.name.split(' ')[0]} 👋` : 'Bem-vindo 👋'}
            </Text>
            <Text style={styles.subtitle}>Encontra o teu imóvel ideal</Text>
          </View>
          <TouchableOpacity onPress={() => nav.navigate('Profile')} style={styles.avatarBtn}>
            <Ionicons name="person-circle-outline" size={36} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={COLORS.gray3} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={doSearch}
              placeholder="Pesquisar imóveis..."
              placeholderTextColor={COLORS.gray3}
              style={styles.searchInput}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => nav.navigate('Listings', {})}>
            <Ionicons name="options-outline" size={20} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {/* City pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.citiesScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          <TouchableOpacity
            style={[styles.cityPill, city === '' && styles.cityPillActive]}
            onPress={() => setCity('')}
          >
            <Text style={[styles.cityPillText, city === '' && styles.cityPillTextActive]}>Todas</Text>
          </TouchableOpacity>
          {ANGOLA_CITIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.cityPill, city === c && styles.cityPillActive]}
              onPress={() => { setCity(c); nav.navigate('Listings', { city: c }); }}
            >
              <Text style={[styles.cityPillText, city === c && styles.cityPillTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Property types */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typesScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
          {PROPERTY_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={styles.typeCard}
              onPress={() => nav.navigate('Listings', { type: t.value })}
            >
              <Text style={styles.typeEmoji}>{t.emoji}</Text>
              <Text style={styles.typeLabel}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Em Destaque</Text>
          <TouchableOpacity onPress={() => nav.navigate('Listings', { featured: 'true' })}>
            <Text style={styles.seeAll}>Ver todos →</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={featured?.listings ?? []}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={{ width: 280 }}>
              <ListingCard
                listing={item}
                onPress={() => nav.navigate('PropertyDetail', { slug: item.slug, title: item.title })}
              />
            </View>
          )}
          ListEmptyComponent={
            loadFeatured
              ? <Text style={styles.loadingText}>A carregar...</Text>
              : null
          }
        />

        {/* Recent section */}
        <View style={[styles.sectionHeader, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>Recentes</Text>
          <TouchableOpacity onPress={() => nav.navigate('Listings', {})}>
            <Text style={styles.seeAll}>Ver todos →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          {(recent?.listings ?? []).map((item: any) => (
            <ListingCard
              key={item._id}
              listing={item}
              horizontal
              onPress={() => nav.navigate('PropertyDetail', { slug: item.slug, title: item.title })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: COLORS.bg },
  header:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16 },
  greeting:           { fontSize: 22, fontWeight: '800', color: COLORS.white },
  subtitle:           { fontSize: 13, color: COLORS.gray3, marginTop: 2 },
  avatarBtn:          { padding: 4 },
  searchRow:          { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, marginBottom: 16 },
  searchBox:          { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.bg1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  searchInput:        { flex: 1, color: COLORS.white, fontSize: 14 },
  filterBtn:          { width: 48, height: 48, backgroundColor: COLORS.bg1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  citiesScroll:       { marginBottom: 16 },
  cityPill:           { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg1 },
  cityPillActive:     { backgroundColor: COLORS.goldBg, borderColor: COLORS.gold },
  cityPillText:       { fontSize: 13, color: COLORS.gray2, fontWeight: '500' },
  cityPillTextActive: { color: COLORS.gold },
  typesScroll:        { marginBottom: 20 },
  typeCard:           { backgroundColor: COLORS.bg1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', gap: 4, minWidth: 80 },
  typeEmoji:          { fontSize: 24 },
  typeLabel:          { fontSize: 11, color: COLORS.gray2, fontWeight: '500' },
  sectionHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle:       { fontSize: 18, fontWeight: '700', color: COLORS.white },
  seeAll:             { fontSize: 13, color: COLORS.gold, fontWeight: '500' },
  loadingText:        { color: COLORS.gray3, paddingHorizontal: 16 },
});
