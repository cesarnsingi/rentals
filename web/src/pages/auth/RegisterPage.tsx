import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../lib/api';
import { Input, Button, Select } from '../../components/ui';
import toast from 'react-hot-toast';

export function RegisterPage() {
  const { login } = useAuthStore();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'tenant' });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('A palavra-passe deve ter pelo menos 8 caracteres');
    setLoading(true);
    try {
      await authApi.register(form);
      await login(form.email, form.password);
      navigate('/');
      toast.success('Conta criada com sucesso!');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-xl">AR</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Criar Conta</h1>
          <p className="text-gray-500 text-sm mt-1">Junta-te ao AngolaRentals hoje</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nome completo" value={form.name} onChange={set('name')} placeholder="Carlos Silva" required />
            <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="o.teu@email.com" required />
            <Input label="Palavra-passe" type="password" value={form.password} onChange={set('password')} placeholder="Mínimo 8 caracteres" required />
            <Select
              label="Tipo de conta"
              value={form.role}
              onChange={set('role') as any}
              options={[
                { value: 'tenant',   label: '🔍 Inquilino — Procuro imóvel' },
                { value: 'landlord', label: '🏠 Proprietário — Tenho imóveis para arrendar' },
              ]}
            />
            <Button type="submit" loading={loading} className="w-full mt-2">Criar Conta</Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tens conta?{' '}
            <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium">Iniciar sessão</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
