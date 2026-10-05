import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { usePremium } from '@/lib/premium';
import type { JourneyStage, JourneyTask, StageWithTasks } from '@/types';
import { StageCard } from '@/components/StageCard';
import { ProgressHeader } from '@/components/ProgressHeader';
import { HeroSection } from '@/components/HeroSection';
import { JourneyMap } from '@/components/JourneyMap';
import { Achievements } from '@/components/Achievements';
import { ExportPanel } from '@/components/ExportPanel';
import { CelebrationOverlay } from '@/components/CelebrationOverlay';
import { PricingModal } from '@/components/PricingModal';
import { AdminDashboard } from '@/components/AdminDashboard';

export default function App() {
  const { user } = useAuth();
  const { isAdmin } = usePremium();
  const [stages, setStages] = useState<JourneyStage[]>([]);
  const [tasks, setTasks] = useState<JourneyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStageId, setExpandedStageId] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });
  const [showPricing, setShowPricing] = useState(false);
  const [pricingFeature, setPricingFeature] = useState<string | undefined>(undefined);
  const [view, setView] = useState<'app' | 'admin'>('app');

  const journeyRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [stagesRes, tasksRes] = await Promise.all([
        supabase.from('journey_stages').select('*').order('stage_order'),
        supabase.from('journey_tasks').select('*').order('task_order'),
      ]);

      if (stagesRes.error) throw stagesRes.error;
      if (tasksRes.error) throw tasksRes.error;

      setStages(stagesRes.data ?? []);
      setTasks(tasksRes.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journey data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stagesWithTasks: StageWithTasks[] = useMemo(() => {
    return stages.map((stage) => ({
      ...stage,
      tasks: tasks
        .filter((t) => t.stage_id === stage.id)
        .sort((a, b) => a.task_order - b.task_order),
    }));
  }, [stages, tasks]);

  const completedTasks = tasks.filter((t) => t.is_completed).length;
  const totalTasks = tasks.length;

  const currentStageIndex = useMemo(() => {
    for (let i = 0; i < stagesWithTasks.length; i++) {
      const stage = stagesWithTasks[i];
      const stageComplete =
        stage.tasks.length > 0 && stage.tasks.every((t) => t.is_completed);
      if (!stageComplete) return i;
    }
    return stagesWithTasks.length - 1;
  }, [stagesWithTasks]);

  const currentStage = stagesWithTasks[currentStageIndex];

  const prevStageComplete = useRef<Record<number, boolean>>({});

  useEffect(() => {
    stagesWithTasks.forEach((stage, i) => {
      const isComplete =
        stage.tasks.length > 0 && stage.tasks.every((t) => t.is_completed);
      const wasComplete = prevStageComplete.current[i] ?? false;

      if (isComplete && !wasComplete) {
        const allDone =
          stagesWithTasks.every(
            (s) => s.tasks.length > 0 && s.tasks.every((t) => t.is_completed),
          );
        setCelebration({
          show: true,
          message: allDone ? 'You are a Company Owner!' : `${stage.title} Complete!`,
        });
      }
      prevStageComplete.current[i] = isComplete;
    });
  }, [stagesWithTasks]);

  const isStageUnlocked = useCallback(
    (stageIndex: number) => {
      if (stageIndex === 0) return true;
      const prevStage = stagesWithTasks[stageIndex - 1];
      if (!prevStage || prevStage.tasks.length === 0) return true;
      return prevStage.tasks.every((t) => t.is_completed);
    },
    [stagesWithTasks],
  );

  const handleToggleTask = useCallback(async (taskId: string, completed: boolean) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, is_completed: completed, completed_at: completed ? new Date().toISOString() : null }
          : t,
      ),
    );

    const { error: updateError } = await supabase
      .from('journey_tasks')
      .update({
        is_completed: completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq('id', taskId);

    if (updateError) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, is_completed: !completed, completed_at: null }
            : t,
        ),
      );
      setError('Failed to update task. Please try again.');
    }
  }, []);

  const handleSaveNote = useCallback(async (taskId: string, notes: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, notes } : t)),
    );

    const { error: noteError } = await supabase
      .from('journey_tasks')
      .update({ notes })
      .eq('id', taskId);

    if (noteError) {
      setError('Failed to save note. Please try again.');
    }
  }, []);

  const handleToggleStage = (stageId: string, stageIndex: number) => {
    if (!isStageUnlocked(stageIndex)) return;
    setExpandedStageId(expandedStageId === stageId ? null : stageId);
  };

  const handleSelectFromMap = (stageId: string) => {
    setExpandedStageId(stageId);
    setTimeout(() => {
      const el = document.getElementById(`stage-${stageId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const scrollToJourney = () => {
    journeyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openPricing = (feature?: string) => {
    setPricingFeature(feature);
    setShowPricing(true);
  };

  useEffect(() => {
    if (stagesWithTasks.length > 0 && !expandedStageId) {
      setExpandedStageId(stagesWithTasks[currentStageIndex]?.id ?? null);
    }
  }, [stagesWithTasks, currentStageIndex, expandedStageId]);

  if (view === 'admin' && user && isAdmin) {
    return <AdminDashboard onBack={() => setView('app')} />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <p className="text-sm text-slate-500">Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (error && stages.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="flex max-w-md flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="h-8 w-8 text-rose-500" />
          <p className="text-sm text-slate-600">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const allComplete = totalTasks > 0 && completedTasks === totalTasks;

  return (
    <div className="min-h-screen bg-slate-50">
      <CelebrationOverlay
        show={celebration.show}
        message={celebration.message}
        onDone={() => setCelebration({ show: false, message: '' })}
      />

      <PricingModal
        show={showPricing}
        onClose={() => setShowPricing(false)}
        feature={pricingFeature}
      />

      {/* Hero */}
      <HeroSection
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        totalStages={stagesWithTasks.length}
        onStart={scrollToJourney}
        onUpgrade={() => openPricing()}
        onAdminDashboard={() => setView('admin')}
      />

      {/* Main content */}
      <main ref={journeyRef} className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-10">
        {/* Error toast */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
            <p className="text-sm text-rose-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-rose-400 hover:text-rose-600"
            >
              <span className="sr-only">Dismiss</span>
              <AlertCircle className="h-4 w-4 rotate-45" />
            </button>
          </div>
        )}

        {/* Progress + Export row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {currentStage && (
            <div className="flex-1">
              <ProgressHeader
                totalTasks={totalTasks}
                completedTasks={completedTasks}
                currentStageTitle={currentStage.title}
                currentStageIndex={currentStageIndex}
                totalStages={stagesWithTasks.length}
              />
            </div>
          )}
          <div className="shrink-0 sm:mt-0">
            <ExportPanel
              stages={stagesWithTasks}
              completedTasks={completedTasks}
              totalTasks={totalTasks}
              onUpgrade={() => openPricing('Progress Export')}
            />
          </div>
        </div>

        {/* All complete banner */}
        {allComplete && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-800">You have arrived.</h3>
              <p className="text-sm text-emerald-600">
                Every milestone is complete. You are no longer doing it all yourself — you own a company.
              </p>
            </div>
          </div>
        )}

        {/* Journey map */}
        <div className="mt-6">
          <JourneyMap
            stages={stagesWithTasks}
            currentStageIndex={currentStageIndex}
            onSelectStage={handleSelectFromMap}
          />
        </div>

        {/* Achievements */}
        <div className="mt-6">
          <Achievements
            stages={stagesWithTasks}
            completedTasks={completedTasks}
            onUpgrade={() => openPricing('Achievement Gallery')}
          />
        </div>

        {/* Stages */}
        <div className="mt-8 space-y-4">
          {stagesWithTasks.map((stage, index) => (
            <div key={stage.id} id={`stage-${stage.id}`} className="relative pt-4 first:pt-0 scroll-mt-6">
              <StageCard
                stage={stage}
                index={index}
                isUnlocked={isStageUnlocked(index)}
                isExpanded={expandedStageId === stage.id}
                onToggle={() => handleToggleStage(stage.id, index)}
                onToggleTask={handleToggleTask}
                onSaveNote={handleSaveNote}
                onUpgrade={() => openPricing('Personal Notes')}
              />
              {index < stagesWithTasks.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowRight className="h-4 w-4 rotate-90 text-slate-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-200 pt-6 text-center">
          <p className="text-xs text-slate-400">
            Your progress is saved automatically. Complete each stage to unlock the next.
          </p>
        </footer>
      </main>
    </div>
  );
}
