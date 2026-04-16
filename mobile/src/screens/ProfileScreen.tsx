import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { bookingsApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import { formatPrice } from '../constants';

export default function ProfileScreen() {
  const nav             = useNavigation<any>();
  const { user, logout, isAuth } = useAuthStore();

  const { data: bookings } = useQuery({
    queryKey: ['mobile-bookings'],
    queryFn:  () => bookingsApi.getAll().then(r => r.data),
    enabled:  isAuth(),
  });

  if (!isAuth()) {
    return (
      <View style={styles.center}>
        <Ionicons name="person-circle-outline" size={72} color={COLORS.gray4} style={{ marginBottom: 16 }} />
        <Text style={styles.emptyTitle}>A tua conta</Text>
        <Text style={styles.emptyText}>Inicia sessão para aceder ao teu perfil e reservas</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => nav.navigate('Auth')}>
          <Text style={styles.loginBtnText}>Iniciar Sessão</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => nav.navigate('Auth', { mode: 'register' })}>
          <Text style={styles.registerText}>Criar conta →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const avatar = user?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? 'U')}&background=c9a84c&color=000&size=128`;

  const BOOKING_STATUS: Record<string, { color: string; label: string }> = {
    pending:   { color: COLORS.gold,  label: 'Pendente'   },
    confirmed: { color: COLORS.green, label: 'Confirmado' },
    cancelled: { color: COLORS.red,   label: 'Cancelado'  },
    completed: { color: COLORS.gray3, label: 'Concluído'  },
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Tens a certeza que queres sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role === 'landlord' ? '🏠 Proprietário' : user?.role === 'admin' ? '⚙️ Admin' : '🔍 Inquilino'}
          </Text>
        </View>
      </View>

      {/* Bookings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>As minhas Reservas</Text>
        {bookings?.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>Nenhuma reserva ainda</Text>
          </View>
        ) : (
          bookings?.slice(0, 5).map((b: any) => {
            const status = BOOKING_STATUS[b.status] ?? { color: COLORS.gray3, label: b.status };
            return (
              <View key={b._id} style={styles.bookingCard}>
                <View style={styles.bookingRow}>
                  <Text style={styles.bookingTitle} numberOfLines={1}>{b.listing?.title}</Text>
                  <Text style={[styles.bookingStatus, { color: status.color }]}>{status.label}</Text>
                </View>
                <Text style={styles.bookingDate}>
                  {new Date(b.startDate).toLocaleDateString('pt-AO')} → {new Date(b.endDate).toLocaleDateString('pt-AO')}
                </Text>
                <Text style={styles.bookingPrice}>{formatPrice(b.totalPrice, b.currency)}</Text>
              </View>
            );
          })
        )}
      </View>

      {/* Menu items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conta</Text>
        {[
          { icon: 'person-outline', label: 'Editar perfil', onPress: () => {} },
          { icon: 'notifications-outline', label: 'Notificações', onPress: () => {} },
          { icon: 'help-circle-outline', label: 'Suporte', onPress: () => {} },
          { icon: 'shield-outline', label: 'Privacidade', onPress: () => {} },
        ].map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress}>
            <Ionicons name={item.icon as any} size={20} color={COLORS.gray2} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.gray4} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.menuItem, styles.menuItemDanger]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
          <Text style={[styles.menuLabel, { color: COLORS.red }]}>Sair</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>AngolaRentals v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bg },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  profileHeader:   { alignItems: 'center', paddingTop: 56, paddingBottom: 28, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  avatar:          { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: COLORS.gold, marginBottom: 14 },
  name:            { fontSize: 22, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  email:           { fontSize: 14, color: COLORS.gray3, marginBottom: 10 },
  roleBadge:       { backgroundColor: COLORS.goldBg, borderWidth: 1, borderColor: COLORS.goldDim, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  roleText:        { color: COLORS.gold, fontSize: 13, fontWeight: '500' },
  section:         { padding: 16 },
  sectionTitle:    { fontSize: 16, fontWeight: '700', color: COLORS.white, marginBottom: 12 },
  emptySection:    { padding: 20, alignItems: 'center', backgroundColor: COLORS.bg1, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border },
  emptySectionText:{ color: COLORS.gray3, fontSize: 14 },
  bookingCard:     { backgroundColor: COLORS.bg1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 14, marginBottom: 10 },
  bookingRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  bookingTitle:    { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.white, marginRight: 8 },
  bookingStatus:   { fontSize: 12, fontWeight: '600' },
  bookingDate:     { fontSize: 12, color: COLORS.gray3, marginBottom: 4 },
  bookingPrice:    { fontSize: 15, fontWeight: '700', color: COLORS.gold },
  menuItem:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuItemDanger:  { borderBottomWidth: 0, marginTop: 8 },
  menuLabel:       { flex: 1, fontSize: 15, color: COLORS.gray1 },
  emptyTitle:      { fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 8, textAlign: 'center' },
  emptyText:       { fontSize: 14, color: COLORS.gray3, textAlign: 'center', marginBottom: 24 },
  loginBtn:        { backgroundColor: COLORS.gold, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, marginBottom: 14 },
  loginBtnText:    { color: COLORS.bg, fontWeight: '700', fontSize: 16 },
  registerText:    { color: COLORS.gold, fontSize: 14, fontWeight: '500' },
  version:         { textAlign: 'center', color: COLORS.gray4, fontSize: 12, marginTop: 8 },
  goldDim:         COLORS.goldDim,
});
