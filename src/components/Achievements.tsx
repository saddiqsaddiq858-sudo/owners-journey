import {
  Award,
  Flame,
  TrendingUp,
  Star,
  Crown,
  Rocket,
  Trophy,
  Lock,
  type LucideIcon,
} from 'lucide-react';
import type { StageWithTasks } from '@/types';
import { usePremium } from '@/lib/premium';

interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  check: (stages: StageWithTasks[], completedTasks: number) => boolean;
  color: string;
}

const achievements: AchievementBadge[] = [
  {
    id: 'first-step',
    title: 'First Step',
    description: 'Complete your first milestone',
    icon: Rocket,
    check: (_, completed) => completed >= 1,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'solo-complete',
    title: 'Solo Master',
    description: 'Complete the Solo Operator stage',
    icon: Star,
    check: (stages) =>
      stages[0]?.tasks.length > 0 && stages[0].tasks.every((t) => t.is_completed),
    color: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'delegator',
    title: 'The Delegator',
    description: 'Complete the Delegating stage',
    icon: TrendingUp,
    check: (stages) =>
      stages[1]?.tasks.length > 0 && stages[1].tasks.every((t) => t.is_completed),
    color: 'from-teal-500 to-emerald-500',
  },
  {
    id: 'systems-thinker',
    title: 'Systems Thinker',
    description: 'Complete the Building Systems stage',
    icon: Award,
    check: (stages) =>
      stages[2]?.tasks.length > 0 && stages[2].tasks.every((t) => t.is_completed),
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'team-leader',
    title: 'Team Leader',
    description: 'Complete the Leading a Team stage',
    icon: Flame,
    check: (stages) =>
      stages[3]?.tasks.length > 0 && stages[3].tasks.every((t) => t.is_completed),
    color: 'from-rose-500 to-pink-500',
  },
  {
    id: 'company-owner',
    title: 'Company Owner',
    description: 'Complete the entire journey',
    icon: Crown,
    check: (stages) =>
      stages.every((s) => s.tasks.length > 0 && s.tasks.every((t) => t.is_completed)),
    color: 'from-emerald-500 to-green-600',
  },
];

interface AchievementsProps {
  stages: StageWithTasks[];
  completedTasks: number;
  onUpgrade: () => void;
}

export function Achievements({ stages, completedTasks, onUpgrade }: AchievementsProps) {
  const { isPremium } = usePremium();
  const unlockedCount = achievements.filter((a) => a.check(stages, completedTasks)).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Achievements
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">
            {unlockedCount} / {achievements.length} unlocked
          </span>
          {!isPremium && (
            <button
              onClick={onUpgrade}
              className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 transition-colors hover:bg-amber-200"
            >
              <Crown className="h-3 w-3" />
              Premium
            </button>
          )}
        </div>
      </div>

      {isPremium ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {achievements.map((badge) => {
            const unlocked = badge.check(stages, completedTasks);
            const Icon = badge.icon;

            return (
              <div
                key={badge.id}
                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-300 ${
                  unlocked
                    ? 'border-transparent bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm'
                    : 'border-slate-100 bg-slate-50/50'
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
                    unlocked
                      ? `bg-gradient-to-br ${badge.color} text-white shadow-md`
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {unlocked ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                </div>
                <div>
                  <div
                    className={`text-xs font-bold ${
                      unlocked ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {badge.title}
                  </div>
                  <div
                    className={`mt-0.5 text-[11px] leading-tight ${
                      unlocked ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {badge.description}
                  </div>
                </div>
                {unlocked && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 shadow-sm">
                    <Star className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4">
          {/* Show only the first achievement as a preview */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {achievements.map((badge, i) => {
              const unlocked = badge.check(stages, completedTasks);
              const Icon = badge.icon;

              return (
                <div
                  key={badge.id}
                  className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-300 ${
                    i === 0
                      ? unlocked
                        ? 'border-transparent bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm'
                        : 'border-slate-100 bg-slate-50/50'
                      : 'border-slate-100 bg-slate-50/30'
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
                      i === 0
                        ? unlocked
                          ? `bg-gradient-to-br ${badge.color} text-white shadow-md`
                          : 'bg-slate-200 text-slate-400'
                        : 'bg-slate-200/50 text-slate-300'
                    }`}
                  >
                    {i === 0 && unlocked ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                  </div>
                  <div>
                    <div
                      className={`text-xs font-bold ${
                        i === 0 ? 'text-slate-700' : 'text-slate-400'
                      }`}
                    >
                      {badge.title}
                    </div>
                    <div
                      className={`mt-0.5 text-[11px] leading-tight ${
                        i === 0 ? 'text-slate-500' : 'text-slate-300'
                      }`}
                    >
                      {i === 0 ? badge.description : 'Unlock with Premium'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={onUpgrade}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 transition-all hover:border-amber-300 hover:bg-amber-100"
          >
            <Crown className="h-4 w-4" />
            Unlock all achievements with Premium
          </button>
        </div>
      )}
    </div>
  );
}
