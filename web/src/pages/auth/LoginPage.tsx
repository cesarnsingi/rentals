// ── LoginPage.tsx ─────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Input, Button } from '../../components/ui';
import toast from 'react-hot-toast';

export function LoginPage() {
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
      toast.success('Bem-vindo de volta!');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Erro ao iniciar sessão');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-xl">AR</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Iniciar Sessão</h1>
          <p className="text-gray-500 text-sm mt-1">Bem-vindo de volta ao AngolaRentals</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="o.teu@email.com" required />
            <Input label="Palavra-passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            <Button type="submit" loading={loading} className="w-full mt-2">Entrar</Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Não tens conta?{' '}
            <Link to="/register" className="text-gold-400 hover:text-gold-300 font-medium">Registar</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          Conta de teste: carlos@landlord.ao / Test@1234
        </p>
      </div>
    </div>
  );
}
