import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface PremiumContextValue {
  isPremium: boolean;
  isAdmin: boolean;
  loading: boolean;
  checkStatus: () => Promise<void>;
  activateAfterPayment: (reference: string) => Promise<boolean>;
}

const PremiumContext = createContext<PremiumContextValue | null>(null);

const PREMIUM_KEY = 'oj_premium_status';
const PREMIUM_EXPIRY_KEY = 'oj_premium_expiry';

const ADMIN_EMAILS = [
  'admin@ownersjourney.com',
  'admin@bolt.com',
];

export function PremiumProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    if (!user) {
      setIsPremium(false);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const admin = ADMIN_EMAILS.includes(user.email ?? '');
    setIsAdmin(admin);

    if (admin) {
      setIsPremium(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const localExpiry = localStorage.getItem(PREMIUM_EXPIRY_KEY);
      const localStatus = localStorage.getItem(PREMIUM_KEY);
      if (localStatus === 'active' && localExpiry) {
        if (new Date(localExpiry) > new Date()) {
          setIsPremium(true);
        } else {
          localStorage.removeItem(PREMIUM_KEY);
          localStorage.removeItem(PREMIUM_EXPIRY_KEY);
          setIsPremium(false);
        }
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('status, expires_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('activated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data && data.expires_at) {
        if (new Date(data.expires_at) > new Date()) {
          setIsPremium(true);
          localStorage.setItem(PREMIUM_KEY, 'active');
          localStorage.setItem(PREMIUM_EXPIRY_KEY, data.expires_at);
        }
      }
    } catch {
      // Silently fail — use local status
    } finally {
      setLoading(false);
    }
  }, [user]);

  const activateAfterPayment = useCallback(
    async (reference: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const response = await fetch(`${supabaseUrl}/functions/v1/paystack-verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
          },
          body: JSON.stringify({ reference, user_id: user.id }),
        });

        if (!response.ok) return false;

        const data = await response.json();
        if (data.status === 'active' && data.expires_at) {
          setIsPremium(true);
          localStorage.setItem(PREMIUM_KEY, 'active');
          localStorage.setItem(PREMIUM_EXPIRY_KEY, data.expires_at);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [user],
  );

  useEffect(() => {
    checkStatus();

    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('reference');
    if (ref && user) {
      activateAfterPayment(ref).then((success) => {
        if (success) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    }
  }, [checkStatus, activateAfterPayment, user]);

  return (
    <PremiumContext.Provider value={{ isPremium, isAdmin, loading, checkStatus, activateAfterPayment }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium must be used within PremiumProvider');
  return ctx;
}
