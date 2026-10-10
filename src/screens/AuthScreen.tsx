import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Spinner } from '@/components/ui';
import { LanguageSelector } from '@/components/UniversalHeader';

export function AuthScreen() {
  const { t } = useTranslation();
  const { signIn, signUp, user } = useAuth();
const navigate = useNavigate();

useEffect(() => {
  if (user) {
    navigate('/setup');
  }
}, [user, navigate]);

const [mode, setMode] = useState<'login' | 'register'>('login');  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const result = mode === 'login' ? await signIn(email, password) : await signUp(email, password, name);
    setBusy(false);
    if (result.error) {
      setError(result.error);
    }
    // Navigation is handled by onAuthStateChange + AppRoutes logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300/10 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <div className="rounded-xl bg-white/15 backdrop-blur-sm px-2 py-1">
          <LanguageSelector compact />
        </div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm mb-4">
            <Sparkles className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white">{t('appName')}</h1>
          <p className="text-teal-100 mt-2 text-sm">{t('tagline')}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-7">
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${mode === 'login' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500'}`}
            >
              {t('signIn')}
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${mode === 'register' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500'}`}
            >
              {t('signUp')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <Input label={t('yourName')} value={name} onChange={setName} placeholder={t('parent')} />
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth className="bg-teal-600 hover:bg-teal-700" disabled={busy}>
              {busy ? <Spinner /> : (
                <>
                  {mode === 'login' ? t('signIn') : t('signUp')}
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            {t('byContinuing')}
          </p>
        </div>

        <p className="text-center mt-6">
          <Link to="/" className="text-teal-100 text-sm hover:text-white">
            {t('backToWelcome')}
          </Link>
        </p>
      </div>
    </div>
  );
}
