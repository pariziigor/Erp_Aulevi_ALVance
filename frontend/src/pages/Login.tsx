// frontend/src/pages/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { Lock, Mail, ShieldAlert } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Falha na conexão com o servidor.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-4">
      <div className="w-full max-w-md border-4 border-black bg-white p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Header */}
        <div className="mb-8 border-b-2 border-black pb-4 text-center">
          <h1 className="text-3xl font-black uppercase tracking-tighter">AULEVI NEXUS</h1>
          <p className="text-xs font-mono uppercase text-gray-500 mt-1">Core Access Control // IAM</p>
        </div>

        {/* Notificação de Erro */}
        {error && (
          <div className="mb-6 flex items-center gap-3 border-2 border-black bg-red-50 p-4 font-medium text-black">
            <ShieldAlert size={20} className="shrink-0" />
            <span className="text-xs font-mono uppercase">{error}</span>
          </div>
        )}

        {/* Formulário Brutalista */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2">E-mail Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome.sobrenome@aulevi.com"
                className="w-full border-2 border-black p-3 pl-10 text-sm focus:bg-gray-50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2">Senha de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border-2 border-black p-3 pl-10 text-sm focus:bg-gray-50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full border-2 border-black bg-black p-4 text-sm font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(150,150,150,1)] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
          >
            {isSubmitting ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA'}
          </button>
        </form>
      </div>
    </div>
  );
};