import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
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
    let mounted = true;

    // onAuthStateChange is the single source of truth for session restoration.
    // Supabase fires INITIAL_SESSION once it has finished reading the persisted
    // session from localStorage. This is more reliable than getSession() alone,
    // which can resolve with null before the async storage read completes.
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mounted) return;

      (async () => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          setLoading(true);
          await loadFamilyData(s.user.id);
        } else {
          setFamily(null);
          setMembers([]);
          setActiveMemberState(null);
        }
        if (mounted) {
          setLoading(false);
          setAuthInitialized(true);
        }
      })();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);
const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { error: error?.message ?? null };
};
 const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    setSession(data.session);
    setUser(data.session.user);
    await loadFamilyData(data.session.user.id);
  }

  return { error: null };
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
