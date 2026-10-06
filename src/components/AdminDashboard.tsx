import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Loader2,
  Crown,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { usePremium } from '@/lib/premium';
import { supabase } from '@/lib/supabase';

interface AdminStats {
  total_users: number;
  total_subscriptions: number;
  active_subscriptions: number;
  pending_subscriptions: number;
  revenue_by_currency: Record<string, number>;
  recent_subscriptions: Array<{
    id: string;
    status: string;
    amount_kobo: number | null;
    currency: string;
    email: string | null;
    created_at: string;
    activated_at: string | null;
    expires_at: string | null;
    user_id: string | null;
  }>;
  recent_events: Array<{
    id: string;
    event_type: string;
    created_at: string;
    subscription_id: string | null;
  }>;
  task_stats: {
    total_tasks: number;
    completed_tasks: number;
    completion_rate: number;
  };
  stage_count: number;
}

interface AdminDashboardProps {
  onBack: () => void;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  GHS: '₵',
  NGN: '₦',
  KES: 'KSh',
  ZAR: 'R',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

function formatRevenue(kobo: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const amount = kobo / 100;
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function statusColor(status: string): string {
  switch (status) {
    case 'active': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'cancelled': return 'text-slate-500 bg-slate-50 border-slate-200';
    case 'expired': return 'text-rose-500 bg-rose-50 border-rose-200';
    default: return 'text-slate-500 bg-slate-50 border-slate-200';
  }
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const { user } = useAuth();
  const { isAdmin } = usePremium();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`${supabaseUrl}/functions/v1/admin-stats`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session?.access_token || ''}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to load admin data');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchStats();
    }
  }, [user, isAdmin, fetchStats]);

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex max-w-md flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="h-8 w-8 text-rose-500" />
          <p className="text-sm font-semibold text-slate-700">Admin access required</p>
          <p className="text-xs text-slate-500">Sign in with an admin account to view the dashboard.</p>
          <button
            onClick={onBack}
            className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
          >
            Back to App
          </button>
        </div>
      </div>
    );
  }

  const statCards: { icon: LucideIcon; label: string; value: string | number; color: string }[] = [
    { icon: Users, label: 'Total Users', value: stats?.total_users ?? 0, color: 'from-blue-500 to-blue-600' },
    { icon: Crown, label: 'Active Premium', value: stats?.active_subscriptions ?? 0, color: 'from-amber-500 to-orange-500' },
    { icon: Clock, label: 'Pending Payments', value: stats?.pending_subscriptions ?? 0, color: 'from-slate-400 to-slate-500' },
    { icon: TrendingUp, label: 'Journey Stages', value: stats?.stage_count ?? 0, color: 'from-teal-500 to-teal-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">Admin Dashboard</h1>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {stats && !loading && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-3 text-2xl font-extrabold text-slate-900">{card.value}</div>
                  <div className="text-xs font-medium text-slate-400">{card.label}</div>
                </div>
              ))}
            </div>

            {/* Revenue + task completion */}
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {/* Revenue */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-base font-bold text-slate-900">Revenue (Active Subscriptions)</h2>
                </div>
                {Object.keys(stats.revenue_by_currency).length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {Object.entries(stats.revenue_by_currency).map(([currency, amount]) => (
                      <div key={currency} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                        <span className="text-sm font-semibold text-slate-600">{currency}</span>
                        <span className="text-lg font-extrabold text-emerald-600">
                          {formatRevenue(amount, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-400">No active subscriptions yet.</p>
                )}
                <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs text-slate-500">{stats.active_subscriptions} active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-xs text-slate-500">{stats.pending_subscriptions} pending</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-500">{stats.total_subscriptions} total</span>
                  </div>
                </div>
              </div>

              {/* Task completion */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">User Progress</h2>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-slate-500">Completion Rate</span>
                    <span className="text-2xl font-extrabold text-slate-900">{stats.task_stats.completion_rate}%</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all"
                      style={{ width: `${stats.task_stats.completion_rate}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>{stats.task_stats.completed_tasks} completed</span>
                    <span>{stats.task_stats.total_tasks} total milestones</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent subscriptions */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">Recent Subscriptions</h2>
              {stats.recent_subscriptions.length > 0 ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <th className="pb-2 pr-4">Email</th>
                        <th className="pb-2 pr-4">Status</th>
                        <th className="pb-2 pr-4">Amount</th>
                        <th className="pb-2 pr-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent_subscriptions.map((sub) => (
                        <tr key={sub.id} className="border-b border-slate-50">
                          <td className="py-3 pr-4 text-slate-700">{sub.email || '—'}</td>
                          <td className="py-3 pr-4">
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${statusColor(sub.status)}`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-slate-700">
                            {sub.amount_kobo ? formatRevenue(sub.amount_kobo, sub.currency) : '—'}
                          </td>
                          <td className="py-3 pr-4 text-slate-400">{formatDate(sub.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-400">No subscriptions yet.</p>
              )}
            </div>

            {/* Recent events */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
              {stats.recent_events.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {stats.recent_events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">{event.event_type}</span>
                      </div>
                      <span className="text-xs text-slate-400">{formatDate(event.created_at)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-400">No recent activity.</p>
              )}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={fetchStats}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                <TrendingUp className="h-4 w-4" />
                Refresh Data
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
