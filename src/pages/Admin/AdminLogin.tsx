import { useState } from 'react';
import { Scissors, Eye, EyeOff, Loader2 } from 'lucide-react';
import { businessConfig } from '../../config/business';
import { supabase } from '../../lib/supabase';

interface Props {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: Props) {
  const [email, setEmail] = useState('admin@exclusivebarber.co');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError('Ingresa una contraseña'); return; }
    setLoading(true);
    setError('');
    try {
      const { data, error: dbError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', email)
        .eq('password_hash', password)
        .single();
      if (dbError || !data) {
        setError('Correo o contraseña incorrectos');
      } else {
        onLogin();
      }
    } catch {
      setError('Error al conectar. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 30% 50%, #1a1100 0%, #080808 70%)' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 flex items-center justify-center shadow-gold-lg mx-auto mb-4">
            <Scissors size={28} className="text-dark" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-white mb-1">{businessConfig.name}</h1>
          <p className="text-zinc-500 text-sm">Panel de Administración</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/10">
          <h2 className="font-semibold text-white text-lg mb-6">Iniciar sesión</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 glass border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-gold/40 transition-colors bg-transparent"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full px-4 py-3 pr-11 glass border border-white/10 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-gold/40 transition-colors bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <span>Entrar al Panel</span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-4">
          <a href="/" className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors">
            ← Volver al sitio
          </a>
        </p>
      </div>
    </div>
  );
}
```

Guarda **Ctrl + S** y los 3 comandos de git:
```
git add .
git commit -m "login admin con supabase"
git push