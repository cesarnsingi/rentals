import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';

type Mode = 'login' | 'register';

export default function AuthScreen() {
  const nav         = useNavigation<any>();
  const route       = useRoute<any>();
  const { login }   = useAuthStore();

  const [mode, setMode]         = useState<Mode>(route.params?.mode ?? 'login');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<'tenant' | 'landlord'>('tenant');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos obrigatórios', 'Preenche o email e a palavra-passe');
      return;
    }
    if (!isLogin && !name.trim()) {
      Alert.alert('Campo obrigatório', 'Escreve o teu nome');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Palavra-passe fraca', 'A palavra-passe deve ter pelo menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await authApi.register({ name: name.trim(), email: email.trim(), password, role });
        await login(email.trim(), password);
      }
      nav.goBack();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? (isLogin ? 'Credenciais inválidas' : 'Erro ao criar conta');
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => nav.goBack()}>
          <Ionicons name="close" size={22} color={COLORS.gray2} />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logo}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>AR</Text>
          </View>
          <Text style={styles.appName}>Angola<Text style={{ color: COLORS.gold }}>Rentals</Text></Text>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabRow}>
          {(['login', 'register'] as Mode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.tab, mode === m && styles.tabActive]}
              onPress={() => setMode(m)}
            >
              <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                {m === 'login' ? 'Iniciar Sessão' : 'Criar Conta'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          {!isLogin && (
            <>
              <Text style={styles.label}>Nome completo</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color={COLORS.gray3} style={styles.inputIcon} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Carlos Silva"
                  placeholderTextColor={COLORS.gray4}
                  autoComplete="name"
                  style={styles.input}
                />
              </View>
            </>
          )}

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={COLORS.gray3} style={styles.inputIcon} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="o.teu@email.com"
              placeholderTextColor={COLORS.gray4}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
            />
          </View>

          <Text style={styles.label}>Palavra-passe</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.gray3} style={styles.inputIcon} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor={COLORS.gray4}
              secureTextEntry={!showPw}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              style={[styles.input, { flex: 1 }]}
            />
            <TouchableOpacity onPress={() => setShowPw(v => !v)} style={styles.showPwBtn}>
              <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.gray3} />
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <>
              <Text style={styles.label}>Tipo de conta</Text>
              <View style={styles.roleRow}>
                {[
                  { value: 'tenant',   label: '🔍 Inquilino',    desc: 'Procuro imóvel' },
                  { value: 'landlord', label: '🏠 Proprietário', desc: 'Tenho imóveis' },
                ].map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.roleCard, role === r.value && styles.roleCardActive]}
                    onPress={() => setRole(r.value as any)}
                  >
                    <Text style={styles.roleEmoji}>{r.label.split(' ')[0]}</Text>
                    <Text style={[styles.roleLabel, role === r.value && styles.roleLabelActive]}>
                      {r.label.split(' ').slice(1).join(' ')}
                    </Text>
                    <Text style={styles.roleDesc}>{r.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={COLORS.bg} />
              : <Text style={styles.submitBtnText}>{isLogin ? 'Entrar' : 'Criar Conta'}</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Switch mode */}
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>
            {isLogin ? 'Não tens conta?' : 'Já tens conta?'}
          </Text>
          <TouchableOpacity onPress={() => setMode(isLogin ? 'register' : 'login')}>
            <Text style={styles.switchLink}>
              {isLogin ? ' Criar conta →' : ' Iniciar sessão →'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Demo credentials */}
        {isLogin && (
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => { setEmail('carlos@landlord.ao'); setPassword('Test@1234'); }}
          >
            <Text style={styles.demoBtnText}>Usar conta de demonstração</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.bg },
  scroll:         { flexGrow: 1, padding: 24, paddingTop: 60 },
  closeBtn:       { position: 'absolute', top: 20, right: 24, zIndex: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bg1, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  logo:           { alignItems: 'center', marginBottom: 32 },
  logoBox:        { width: 60, height: 60, backgroundColor: COLORS.gold, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  logoText:       { fontSize: 22, fontWeight: '800', color: COLORS.bg },
  appName:        { fontSize: 22, fontWeight: '800', color: COLORS.white },
  tabRow:         { flexDirection: 'row', backgroundColor: COLORS.bg1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 4, marginBottom: 28 },
  tab:            { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive:      { backgroundColor: COLORS.gold },
  tabText:        { fontSize: 14, fontWeight: '600', color: COLORS.gray3 },
  tabTextActive:  { color: COLORS.bg },
  form:           { gap: 6 },
  label:          { fontSize: 12, fontWeight: '600', color: COLORS.gray2, marginBottom: 6, marginTop: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrap:      { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 4 },
  inputIcon:      { marginRight: 10 },
  input:          { flex: 1, color: COLORS.white, fontSize: 15 },
  showPwBtn:      { padding: 4 },
  roleRow:        { flexDirection: 'row', gap: 12, marginBottom: 4 },
  roleCard:       { flex: 1, backgroundColor: COLORS.bg1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  roleCardActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldBg },
  roleEmoji:      { fontSize: 26 },
  roleLabel:      { fontSize: 13, fontWeight: '600', color: COLORS.gray2 },
  roleLabelActive:{ color: COLORS.gold },
  roleDesc:       { fontSize: 11, color: COLORS.gray4, textAlign: 'center' },
  submitBtn:      { backgroundColor: COLORS.gold, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText:  { color: COLORS.bg, fontSize: 16, fontWeight: '700' },
  switchRow:      { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  switchText:     { color: COLORS.gray3, fontSize: 14 },
  switchLink:     { color: COLORS.gold, fontSize: 14, fontWeight: '600' },
  demoBtn:        { marginTop: 14, alignItems: 'center', padding: 10 },
  demoBtnText:    { color: COLORS.gray3, fontSize: 13, textDecorationLine: 'underline' },
  goldBg:         COLORS.goldBg,
});
