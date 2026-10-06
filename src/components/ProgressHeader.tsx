import { TrendingUp, Award } from 'lucide-react';

interface ProgressHeaderProps {
  totalTasks: number;
  completedTasks: number;
  currentStageTitle: string;
  currentStageIndex: number;
  totalStages: number;
}

export function ProgressHeader({
  totalTasks,
  completedTasks,
  currentStageTitle,
  currentStageIndex,
  totalStages,
}: ProgressHeaderProps) {
  const overallPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Overall progress */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Your Journey Progress</h2>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{overallPercent}%</span>
            <span className="text-sm text-slate-400">
              ({completedTasks} of {totalTasks} milestones)
            </span>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

        {/* Current stage badge */}
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Current Stage
            </div>
            <div className="text-sm font-bold text-slate-900">{currentStageTitle}</div>
            <div className="text-xs text-slate-400">
              Stage {currentStageIndex + 1} of {totalStages}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
