import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Family, Member } from '@/types/database';

interface AuthState {
  user: User | null;
  session: Session | null;
  family: Family | null;
  members: Member[];
  activeMember: Member | null;
  loading: boolean;
  authInitialized: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshFamily: () => Promise<void>;
  setActiveMember: (member: Member | null) => void;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeMember, setActiveMemberState] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Track whether getSession() has completed so onAuthStateChange
  // doesn't flip loading=false before the initial session is restored.
  const sessionResolved = useRef(false);

  const loadFamilyData = async (userId: string) => {
    const { data: fam } = await supabase
      .from('families')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle();

    setFamily(fam as Family | null);

    if (fam) {
      const { data: mems } = await supabase
        .from('members')
        .select('*')
        .eq('family_id', fam.id)
        .order('created_at', { ascending: true });
      setMembers((mems as Member[]) || []);
    } else {
      setMembers([]);
    }
  };

  const refreshFamily = async () => {
    if (user) {
      await loadFamilyData(user.id);
    }
  };

  const completeOnboarding = async () => {
    if (!family) return;
    const { error } = await supabase
      .from('families')
      .update({ is_onboarded: true })
      .eq('id', family.id);
    if (!error) {
      setFamily({ ...family, is_onboarded: true });
    }
  };

  useEffect(() => {
    // 1. Wait for the initial session to fully resolve from storage.
    //    This is the critical step on page reload (F5) — the session
    //    is stored in localStorage but takes a tick to read.
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      sessionResolved.current = true;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadFamilyData(s.user.id).finally(() => {
          setLoading(false);
          setAuthInitialized(true);
        });
      } else {
        setLoading(false);
        setAuthInitialized(true);
      }
    });

    // 2. Subscribe to auth state changes (sign in, sign out, token refresh).
    //    Guard against firing before getSession() has resolved — on reload,
    //    onAuthStateChange can emit an INITIAL_SESSION event with a null
    //    session before the stored session is read, which would cause a
    //    premature redirect to /auth or /setup.
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      // Skip the initial session event — getSession() handles it above.
      if (event === 'INITIAL_SESSION') return;

      (async () => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          await loadFamilyData(s.user.id);
        } else {
          setFamily(null);
          setMembers([]);
          setActiveMemberState(null);
        }
        setLoading(false);
        setAuthInitialized(true);
      })();
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setFamily(null);
    setMembers([]);
    setActiveMemberState(null);
  };

  const setActiveMember = (member: Member | null) => {
    setActiveMemberState(member);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        family,
        members,
        activeMember,
        loading,
        authInitialized,
        signUp,
        signIn,
        signOut,
        refreshFamily,
        setActiveMember,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
