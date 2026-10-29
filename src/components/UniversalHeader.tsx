import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ArrowLeft, Globe, ChevronDown } from 'lucide-react';
import { languages, setLanguage, getCurrentLanguage, type Language } from '@/lib/i18n';

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { i18n: i18nInstance } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = getCurrentLanguage();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentLang = languages.find((l) => l.code === current) || languages[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all ${compact ? '' : 'border border-gray-200'}`}
      >
        <Globe size={16} />
        <span className="hidden sm:inline">{currentLang.flag} {currentLang.label}</span>
        <span className="sm:hidden">{currentLang.flag}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-36 rounded-xl bg-white shadow-lg border border-gray-100 py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code as Language);
                i18nInstance.changeLanguage(lang.code);
                setOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-all ${
                current === lang.code ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function UniversalHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const isDashboard = location.pathname === '/dashboard';
  const isRoot = location.pathname === '/';

 return (
  <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-100">

    <div className="flex items-center justify-between px-4 py-3 lg:px-6">

      {!isRoot && (
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 3l2 5h5l-4 3 1.5 5L12 13l-4.5 3L9 11 5 8h5z" />
            </svg>
          </div>

          <span className="text-sm font-bold text-gray-900 hidden sm:inline">
            {t('appName')}
          </span>
        </button>
      )}

      <LanguageSelector compact />

    </div>

    {title && (
      <div className="px-4 lg:px-6 pb-3">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
          {title}
        </h1>

        {subtitle && (
          <p className="text-sm text-gray-500 mt-0.5">
            {subtitle}
          </p>
        )}

      </div>
    )}

  </div>
);
}
