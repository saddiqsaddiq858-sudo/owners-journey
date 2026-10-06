import { Download, Share2, X, Check, Lock } from 'lucide-react';
import { useState } from 'react';
import type { StageWithTasks } from '@/types';
import { usePremium } from '@/lib/premium';

interface ExportPanelProps {
  stages: StageWithTasks[];
  completedTasks: number;
  totalTasks: number;
  onUpgrade: () => void;
}

export function ExportPanel({ stages, completedTasks, totalTasks, onUpgrade }: ExportPanelProps) {
  const { isPremium } = usePremium();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const overallPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const buildText = () => {
    const lines: string[] = [
      'THE OWNER\'S JOURNEY — Progress Report',
      '==========================================',
      `Overall Progress: ${completedTasks}/${totalTasks} milestones (${overallPercent}%)`,
      '',
    ];

    stages.forEach((stage) => {
      const stageComplete =
        stage.tasks.length > 0 && stage.tasks.every((t) => t.is_completed);
      const stageCompleted = stage.tasks.filter((t) => t.is_completed).length;
      lines.push(
        `Stage ${stage.stage_order}: ${stage.title} [${stageCompleted}/${stage.tasks.length}]${
          stageComplete ? ' ✓ COMPLETE' : ''
        }`,
      );
      if (stage.estimated_timeframe) {
        lines.push(`  Typical timeframe: ${stage.estimated_timeframe}`);
      }
      stage.tasks.forEach((task) => {
        lines.push(`  ${task.is_completed ? '[x]' : '[ ]'} ${task.title}`);
        if (task.notes) {
          lines.push(`      Notes: ${task.notes}`);
        }
      });
      lines.push('');
    });

    lines.push(
      '==========================================',
      `Generated: ${new Date().toLocaleDateString()}`,
    );

    return lines.join('\n');
  };

  const handleDownload = () => {
    if (!isPremium) {
      onUpgrade();
      return;
    }
    const text = buildText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `owners-journey-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowModal(false);
  };

  const handleCopy = async () => {
    if (!isPremium) {
      onUpgrade();
      return;
    }
    try {
      await navigator.clipboard.writeText(buildText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  const handleButtonClick = () => {
    if (!isPremium) {
      onUpgrade();
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={handleButtonClick}
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
            isPremium
              ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              : 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100'
          }`}
        >
          {isPremium ? (
            <>
              <Download className="h-4 w-4" />
              Export Progress
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Export Progress
            </>
          )}
        </button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Export Your Progress</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 transition-colors hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Download a text summary of your journey progress, including all stages,
              completed milestones, and your personal notes. Great for sharing with
              mentors, co-founders, or keeping in your files.
            </p>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Progress</span>
                <span className="font-bold text-slate-900">{overallPercent}%</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">Milestones</span>
                <span className="font-bold text-slate-900">
                  {completedTasks}/{totalTasks}
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={handleDownload}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-700"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
