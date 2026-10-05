import { Crown, Lock } from 'lucide-react';
import { usePremium } from '@/lib/premium';

interface PremiumGateProps {
  featureName: string;
  onUpgrade: () => void;
  children: React.ReactNode;
}

export function PremiumGate({ featureName, onUpgrade, children }: PremiumGateProps) {
  const { isPremium, loading } = usePremium();

  if (loading) {
    return <div className="opacity-50">{children}</div>;
  }

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40 blur-sm">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={onUpgrade}
          className="group flex flex-col items-center gap-2 rounded-2xl border-2 border-amber-200 bg-white/90 px-6 py-4 shadow-lg backdrop-blur-sm transition-all hover:border-amber-300 hover:shadow-xl"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
            <Lock className="h-5 w-5" />
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <Crown className="h-4 w-4 text-amber-500" />
              Premium Feature
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              Unlock {featureName} — upgrade now
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
