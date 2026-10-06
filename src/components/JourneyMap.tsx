import {
  User,
  Users,
  Settings,
  Target,
  Crown,
  Circle,
  CheckCircle2,
  Lock,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import type { StageWithTasks } from '@/types';
import { getTheme } from '@/theme';

const iconMap: Record<string, LucideIcon> = {
  User,
  Users,
  Settings,
  Target,
  Crown,
};

interface JourneyMapProps {
  stages: StageWithTasks[];
  currentStageIndex: number;
  onSelectStage: (stageId: string) => void;
}

export function JourneyMap({ stages, currentStageIndex, onSelectStage }: JourneyMapProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
        Your Roadmap
      </h2>

      {/* Desktop horizontal map */}
      <div className="mt-5 hidden sm:block">
        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-200" />
          <div
            className="absolute top-6 left-6 h-0.5 bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 transition-all duration-700"
            style={{
              width: `calc((100% - 3rem) * ${
                stages.length > 0 ? currentStageIndex / (stages.length - 1) : 0
              })`,
            }}
          />

          <div className="relative flex justify-between">
            {stages.map((stage, i) => {
              const theme = getTheme(stage.color_theme);
              const Icon = iconMap[stage.icon_name] ?? Circle;
              const isComplete =
                stage.tasks.length > 0 && stage.tasks.every((t) => t.is_completed);
              const isCurrent = i === currentStageIndex;
              const isLocked = i > currentStageIndex;

              return (
                <button
                  key={stage.id}
                  onClick={() => !isLocked && onSelectStage(stage.id)}
                  disabled={isLocked}
                  className="group flex flex-col items-center gap-2 disabled:cursor-not-allowed"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isComplete
                        ? `border-transparent bg-gradient-to-br ${theme.gradient} text-white shadow-md`
                        : isCurrent
                          ? `border-transparent bg-gradient-to-br ${theme.gradient} text-white shadow-lg ${theme.glow} ring-4 ${theme.ring} ring-opacity-30`
                          : 'border-slate-200 bg-white text-slate-400'
                    } group-hover:scale-110 ${isLocked ? 'opacity-50' : ''}`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : isLocked ? (
                      <Lock className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-xs font-bold ${
                        isCurrent ? theme.accentText : isComplete ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {stage.title}
                    </div>
                    {stage.estimated_timeframe && (
                      <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-slate-400">
                        <Clock className="h-2.5 w-2.5" />
                        {stage.estimated_timeframe}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile vertical map */}
      <div className="mt-5 sm:hidden">
        <div className="space-y-0">
          {stages.map((stage, i) => {
            const theme = getTheme(stage.color_theme);
            const Icon = iconMap[stage.icon_name] ?? Circle;
            const isComplete =
              stage.tasks.length > 0 && stage.tasks.every((t) => t.is_completed);
            const isCurrent = i === currentStageIndex;
            const isLocked = i > currentStageIndex;

            return (
              <button
                key={stage.id}
                onClick={() => !isLocked && onSelectStage(stage.id)}
                disabled={isLocked}
                className="group flex w-full items-center gap-3 py-2.5 text-left disabled:cursor-not-allowed"
              >
                <div className="relative flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
                      isComplete
                        ? `border-transparent bg-gradient-to-br ${theme.gradient} text-white`
                        : isCurrent
                          ? `border-transparent bg-gradient-to-br ${theme.gradient} text-white`
                          : 'border-slate-200 bg-white text-slate-400'
                    } ${isLocked ? 'opacity-50' : ''}`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isLocked ? (
                      <Lock className="h-3.5 w-3.5" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  {i < stages.length - 1 && (
                    <div className={`mt-1 h-7 w-0.5 ${isComplete ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                  )}
                </div>
                <div className="flex-1 pb-7">
                  <div
                    className={`text-sm font-bold ${
                      isCurrent ? theme.accentText : isComplete ? 'text-emerald-600' : 'text-slate-600'
                    }`}
                  >
                    {stage.title}
                  </div>
                  {stage.estimated_timeframe && (
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      {stage.estimated_timeframe}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
