// ── FavoritesScreen.tsx ───────────────────────────────────────────────────────
import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { listingsApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import ListingCard from '../components/ListingCard';

export function FavoritesScreen() {
  const nav              = useNavigation<any>();
  const { isAuth }       = useAuthStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['mobile-saved'],
    queryFn:  () => listingsApi.getSaved().then(r => r.data),
    enabled:  isAuth(),
  });

  if (!isAuth()) {
    return (
      <View style={styles.center}>
        <Ionicons name="heart-outline" size={56} color={COLORS.gray4} style={{ marginBottom: 16 }} />
        <Text style={styles.emptyTitle}>Guardar imóveis favoritos</Text>
        <Text style={styles.emptyText}>Inicia sessão para ver os teus imóveis guardados</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => nav.navigate('Auth')}>
          <Text style={styles.loginBtnText}>Iniciar Sessão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Guardados</Text>
        <Text style={styles.count}>{data?.length ?? 0} imóveis</Text>
      </View>
      <FlatList
        data={data ?? []}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            onPress={() => nav.navigate('PropertyDetail', { slug: item.slug, title: item.title })}
            onSaveChange={() => refetch()}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.center}>
              <Ionicons name="heart-dislike-outline" size={48} color={COLORS.gray4} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>Nenhum imóvel guardado</Text>
              <Text style={styles.emptyText}>Guarda os imóveis que mais gostas</Text>
              <TouchableOpacity style={styles.loginBtn} onPress={() => nav.navigate('Listings')}>
                <Text style={styles.loginBtnText}>Explorar imóveis</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg },
  header:       { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title:        { fontSize: 24, fontWeight: '800', color: COLORS.white },
  count:        { fontSize: 13, color: COLORS.gray3 },
  list:         { paddingHorizontal: 16, paddingBottom: 24 },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle:   { fontSize: 17, fontWeight: '600', color: COLORS.white, marginBottom: 8, textAlign: 'center' },
  emptyText:    { fontSize: 14, color: COLORS.gray3, textAlign: 'center', marginBottom: 24 },
  loginBtn:     { backgroundColor: COLORS.gold, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 14 },
  loginBtnText: { color: COLORS.bg, fontWeight: '700', fontSize: 15 },
});
