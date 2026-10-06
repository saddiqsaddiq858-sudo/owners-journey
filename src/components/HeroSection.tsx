import {
  Compass,
  Sparkles,
  TrendingUp,
  Target,
  Users,
  Crown,
  ArrowDown,
  LogIn,
  UserCircle,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { useState } from 'react';
import { usePremium } from '@/lib/premium';
import { useAuth } from '@/lib/auth';
import { AuthModal } from '@/components/AuthModal';

interface HeroSectionProps {
  totalTasks: number;
  completedTasks: number;
  totalStages: number;
  onStart: () => void;
  onUpgrade: () => void;
  onAdminDashboard: () => void;
}

export function HeroSection({
  totalTasks,
  completedTasks,
  totalStages,
  onStart,
  onUpgrade,
  onAdminDashboard,
}: HeroSectionProps) {
  const { isPremium, isAdmin } = usePremium();
  const { user, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const stats = [
    { icon: Target, label: 'Milestones', value: totalTasks },
    { icon: TrendingUp, label: 'Growth Stages', value: totalStages },
    { icon: Users, label: 'Roles to Build', value: 5 },
    { icon: Crown, label: 'Final Goal', value: 'Owner' },
  ];

  return (
    <header className="relative overflow-hidden border-b border-slate-200">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

      {/* Decorative grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Decorative glows */}
      <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -right-20 bottom-1/4 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-5 py-16 sm:px-6 sm:py-24">
        {/* Account button — top right */}
        <div className="absolute right-5 top-5 sm:right-6 sm:top-6">
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={onAdminDashboard}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-sm transition-all hover:border-amber-400/50 hover:bg-amber-400/20"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </button>
              )}
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm">
                <UserCircle className="h-3.5 w-3.5" />
                {user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign In
            </button>
          )}
        </div>

        {/* Badge row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>The complete roadmap from solo to CEO</span>
          </div>
          {isPremium && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-sm">
              <Crown className="h-3.5 w-3.5" />
              {isAdmin ? 'Admin Access' : 'Premium'}
            </div>
          )}
        </div>

        {/* Title */}
        <div className="mt-6 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 text-white shadow-xl shadow-blue-500/20">
            <Compass className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
              The Owner's Journey
            </h1>
            <p className="mt-2 text-lg text-slate-300">
              From doing everything yourself to owning a company
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400">
          A practical, step-by-step roadmap for the transition from solo operator to
          company owner. Five stages. Twenty-eight milestones. Track your progress,
          unlock achievements, and build the business you always envisioned.
        </p>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={onStart}
            className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-lg transition-all hover:shadow-xl hover:bg-slate-100"
          >
            {completedTasks > 0 ? 'Continue Your Journey' : 'Start Your Journey'}
            <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          </button>
          {!isPremium && (
            <button
              onClick={onUpgrade}
              className="group inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-6 py-3 text-sm font-bold text-amber-300 backdrop-blur-sm transition-all hover:border-amber-400/50 hover:bg-amber-400/20"
            >
              <Crown className="h-4 w-4" />
              Upgrade to Premium
            </button>
          )}
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300 backdrop-blur-sm">
            <TrendingUp className="h-4 w-4 text-teal-400" />
            <span>{completedTasks} / {totalTasks} milestones complete</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
            >
              <stat.icon className="h-5 w-5 text-slate-400" />
              <div className="mt-2 text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <AuthModal
        show={showAuth}
        onClose={() => setShowAuth(false)}
      />
    </header>
  );
}
