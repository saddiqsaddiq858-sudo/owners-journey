import { useState } from 'react';
import {
  User,
  Users,
  Settings,
  Target,
  Crown,
  CheckCircle2,
  Circle,
  ChevronDown,
  Lock,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import type { StageWithTasks } from '@/types';
import { getTheme } from '@/theme';
import { TaskItem } from '@/components/TaskItem';

const iconMap: Record<string, LucideIcon> = {
  User,
  Users,
  Settings,
  Target,
  Crown,
};

interface StageCardProps {
  stage: StageWithTasks;
  index: number;
  isUnlocked: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onToggleTask: (taskId: string, completed: boolean) => void;
  onSaveNote: (taskId: string, notes: string) => void;
  onUpgrade: () => void;
}

export function StageCard({
  stage,
  index,
  isUnlocked,
  isExpanded,
  onToggle,
  onToggleTask,
  onSaveNote,
  onUpgrade,
}: StageCardProps) {
  const theme = getTheme(stage.color_theme);
  const Icon = iconMap[stage.icon_name] ?? Circle;
  const completedCount = stage.tasks.filter((t) => t.is_completed).length;
  const totalCount = stage.tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = completedCount === totalCount && totalCount > 0;

  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);

  const handleToggleTask = (taskId: string, completed: boolean) => {
    setAnimatingTaskId(taskId);
    setTimeout(() => setAnimatingTaskId(null), 600);
    onToggleTask(taskId, completed);
  };

  return (
    <div
      className={`relative rounded-2xl border-2 transition-all duration-300 ${
        isExpanded
          ? `${theme.cardBorder} ${theme.cardBg} shadow-lg ${theme.glow}`
          : 'border-slate-200 bg-white shadow-sm hover:shadow-md'
      } ${!isUnlocked ? 'opacity-60' : ''}`}
    >
      {index > 0 && (
        <div className="absolute -top-4 left-8 h-4 w-0.5 bg-slate-300" />
      )}

      <button
        onClick={onToggle}
        disabled={!isUnlocked}
        className="flex w-full items-center gap-4 p-5 text-left disabled:cursor-not-allowed"
      >
        {/* Icon */}
        <div
          className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${theme.gradient} ${theme.iconText} shadow-md transition-transform duration-300 ${
            isExpanded ? 'scale-110' : 'scale-100'
          }`}
        >
          <Icon className="h-6 w-6" />
          {isComplete && (
            <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md">
              <CheckCircle2 className={`h-5 w-5 ${theme.accentText}`} />
            </div>
          )}
        </div>

        {/* Title + description */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${theme.accentText}`}>
              Stage {stage.stage_order}
            </span>
            {stage.estimated_timeframe && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                {stage.estimated_timeframe}
              </span>
            )}
            {!isUnlocked && <Lock className="h-3.5 w-3.5 text-slate-400" />}
          </div>
          <h3 className="text-lg font-bold text-slate-900">{stage.title}</h3>
          <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{stage.description}</p>
        </div>

        {/* Progress */}
        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          <div className="text-right">
            <div className="text-sm font-bold text-slate-900">
              {completedCount}/{totalCount}
            </div>
            <div className="text-xs text-slate-400">tasks</div>
          </div>
          <div className={`h-2 w-24 overflow-hidden rounded-full ${theme.progressTrack}`}>
            <div
              className={`h-full rounded-full bg-gradient-to-r ${theme.gradient} transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Mobile progress bar */}
      <div className="px-5 pb-3 sm:hidden">
        <div className={`h-2 w-full overflow-hidden rounded-full ${theme.progressTrack}`}>
          <div
            className={`h-full rounded-full bg-gradient-to-r ${theme.gradient} transition-all duration-500`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-1.5 text-xs text-slate-400">
          {completedCount} of {totalCount} tasks complete
        </div>
      </div>

      {/* Expanded tasks */}
      <div
        className={`grid transition-all duration-300 ${
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-200/60 px-5 pb-5 pt-4">
            <p className="mb-4 text-sm leading-relaxed text-slate-600">{stage.description}</p>
            <div className="space-y-2.5">
              {stage.tasks.map((task, taskIndex) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={taskIndex}
                  theme={theme}
                  isAnimating={animatingTaskId === task.id}
                  onToggle={(completed) => handleToggleTask(task.id, completed)}
                  onSaveNote={onSaveNote}
                  onUpgrade={onUpgrade}
                />
              ))}
            </div>

            {isComplete && (
              <div
                className={`mt-4 flex items-center gap-2 rounded-lg ${theme.completedBg} border ${theme.completedBorder} px-4 py-3`}
              >
                <CheckCircle2 className={`h-5 w-5 ${theme.accentText}`} />
                <p className={`text-sm font-semibold ${theme.accentText}`}>
                  Stage complete! You are ready for the next phase.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
