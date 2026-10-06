import { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  X,
  Loader2,
  CreditCard,
  ShieldCheck,
  Crown,
  StickyNote,
  Download,
  Trophy,
  Lock,
  type LucideIcon,
} from 'lucide-react';
import { usePremium } from '@/lib/premium';
import { useAuth } from '@/lib/auth';
import { AuthModal } from '@/components/AuthModal';

interface PricingModalProps {
  show: boolean;
  onClose: () => void;
  feature?: string;
}

interface PriceInfo {
  usd_amount: number;
  currency: string;
  symbol: string;
  local_amount: number;
  minor_units: number;
  country_code: string;
}

const premiumFeatures: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: StickyNote, title: 'Personal Notes', description: 'Add reflections and plans to every milestone' },
  { icon: Download, title: 'Progress Export', description: 'Download or share your full journey report' },
  { icon: Trophy, title: 'Achievement Gallery', description: 'Unlock and track all six achievement badges' },
  { icon: Crown, title: 'Premium Badge', description: 'Show a premium crown next to your profile' },
];

function formatLocalAmount(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString()}`;
}

export function PricingModal({ show, onClose, feature }: PricingModalProps) {
  const { user } = useAuth();
  const { checkStatus } = usePremium();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceInfo, setPriceInfo] = useState<PriceInfo | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!show) {
      setPriceInfo(null);
      setError(null);
      setShowAuthModal(false);
      return;
    }

    if (!user) return;

    const fetchPrice = async () => {
      setPriceLoading(true);
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const response = await fetch(`${supabaseUrl}/functions/v1/paystack-pricing`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPriceInfo(data);
        }
      } catch {
        // Silently fail — fallback to USD display
      } finally {
        setPriceLoading(false);
      }
    };

    fetchPrice();
  }, [show, user]);

  useEffect(() => {
    if (user && show) {
      setShowAuthModal(false);
      checkStatus();
    }
  }, [user, show, checkStatus]);

  if (!show) return null;

  const handleSubscribe = async () => {
    setError(null);

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!priceInfo) {
      setError('Could not determine your local price. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const callbackUrl = `${window.location.origin}${window.location.pathname}`;

      const response = await fetch(`${supabaseUrl}/functions/v1/paystack-init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify({
          user_id: user.id,
          email: email.trim(),
          callback_url: callbackUrl,
          currency: priceInfo.currency,
          minor_units: priceInfo.minor_units,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to start payment. Please try again.');
      }

      const data = await response.json();

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        throw new Error('No payment URL returned.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const displayPrice = priceInfo
    ? formatLocalAmount(priceInfo.local_amount, priceInfo.symbol)
    : '$25';

  const payButtonText = priceInfo
    ? `Pay ${formatLocalAmount(priceInfo.local_amount, priceInfo.symbol)} with Paystack`
    : 'Pay $25 with Paystack';

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-8">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl" />

            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">Upgrade to Premium</h2>
                <p className="text-sm text-slate-400">Unlock the full Owner's Journey experience</p>
              </div>
            </div>

            {feature && (
              <div className="relative mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                {feature}
              </div>
            )}
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            {/* Sign-in required banner */}
            {!user && (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                  <Lock className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800">Sign in required</p>
                  <p className="text-xs text-amber-600">
                    Create an account or sign in to unlock premium features and manage your subscription.
                  </p>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2">
              {user && priceLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  <span className="text-sm text-slate-400">Detecting your local price...</span>
                </div>
              ) : (
                <>
                  <span className="text-4xl font-extrabold text-slate-900">{displayPrice}</span>
                  <span className="text-sm text-slate-400">
                    one-time payment · 1 year access
                  </span>
                </>
              )}
            </div>

            {/* USD equivalent badge */}
            {user && priceInfo && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                <span>Equivalent to $25 USD</span>
                {priceInfo.country_code && (
                  <span className="text-slate-400">· {priceInfo.country_code}</span>
                )}
              </div>
            )}

            {/* Features list */}
            <div className="mt-5 space-y-3">
              {premiumFeatures.map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <f.icon className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-semibold text-slate-800">{f.title}</span>
                    </div>
                    <p className="text-xs text-slate-500">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Email input — only when signed in */}
            {user && (
              <div className="mt-6">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                />
                <p className="mt-2 text-xs text-slate-400">
                  Your email is used for payment receipts and subscription recovery.
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {/* Pay / Sign in button */}
            <button
              onClick={user ? handleSubscribe : () => setShowAuthModal(true)}
              disabled={loading || (!!user && (priceLoading || !priceInfo))}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:shadow-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting to Paystack...
                </>
              ) : user && priceLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Getting your price...
                </>
              ) : !user ? (
                <>
                  <Lock className="h-4 w-4" />
                  Sign In to Continue
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  {payButtonText}
                </>
              )}
            </button>

            {/* Trust indicators */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure payment
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                Instant access
              </span>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Sign in or create an account to unlock premium features."
      />
    </>
  );
}
