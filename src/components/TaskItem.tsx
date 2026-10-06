import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Circle, StickyNote, Check, X, Lock } from 'lucide-react';
import type { JourneyTask } from '@/types';
import type { ColorTheme } from '@/theme';
import { usePremium } from '@/lib/premium';

interface TaskItemProps {
  task: JourneyTask;
  index: number;
  theme: ColorTheme;
  isAnimating: boolean;
  onToggle: (completed: boolean) => void;
  onSaveNote: (taskId: string, notes: string) => void;
  onUpgrade: () => void;
}

export function TaskItem({ task, index, theme, isAnimating, onToggle, onSaveNote, onUpgrade }: TaskItemProps) {
  const { isPremium } = usePremium();
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [noteText, setNoteText] = useState(task.notes ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setNoteText(task.notes ?? '');
  }, [task.notes]);

  useEffect(() => {
    if (showNoteEditor && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showNoteEditor]);

  const handleSaveNote = () => {
    onSaveNote(task.id, noteText.trim());
    setShowNoteEditor(false);
  };

  const handleCancelNote = () => {
    setNoteText(task.notes ?? '');
    setShowNoteEditor(false);
  };

  const handleNoteClick = () => {
    if (!isPremium) {
      onUpgrade();
      return;
    }
    setShowNoteEditor(!showNoteEditor);
  };

  const hasNote = task.notes && task.notes.trim().length > 0;

  return (
    <div
      className={`group rounded-xl border p-3.5 transition-all duration-200 ${
        task.is_completed
          ? `${theme.completedBg} ${theme.completedBorder}`
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      } ${isAnimating ? 'scale-[1.02]' : 'scale-100'}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(!task.is_completed)}
          className="mt-0.5 shrink-0"
        >
          {task.is_completed ? (
            <CheckCircle2
              className={`h-5 w-5 ${theme.accentText} transition-transform duration-300 ${
                isAnimating ? 'scale-125' : 'scale-100'
              }`}
            />
          ) : (
            <Circle className="h-5 w-5 text-slate-300 transition-colors duration-200 hover:text-slate-400" />
          )}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">{index + 1}</span>
                <h4
                  className={`text-sm font-semibold transition-all duration-200 ${
                    task.is_completed ? 'text-slate-400 line-through' : 'text-slate-800'
                  }`}
                >
                  {task.title}
                </h4>
              </div>
              <p
                className={`mt-1 text-sm leading-relaxed transition-all duration-200 ${
                  task.is_completed ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {task.description}
              </p>
            </div>

            {/* Note button */}
            <button
              onClick={handleNoteClick}
              className={`shrink-0 rounded-lg p-1.5 transition-all ${
                hasNote
                  ? `${theme.accentText} bg-white/50`
                  : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'
              } ${showNoteEditor ? 'opacity-0' : 'opacity-100'}`}
              title={isPremium ? (hasNote ? 'Edit note' : 'Add note') : 'Premium feature'}
            >
              {isPremium ? (
                <StickyNote className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Existing note display */}
          {hasNote && !showNoteEditor && (
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-white/60 px-3 py-2">
              <StickyNote className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${theme.accentText}`} />
              <p className="text-xs italic leading-relaxed text-slate-600">{task.notes}</p>
            </div>
          )}

          {/* Note editor */}
          {showNoteEditor && isPremium && (
            <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2.5">
              <textarea
                ref={textareaRef}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add your own notes, plans, or reflections on this task..."
                rows={3}
                className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={handleCancelNote}
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
                >
                  <Check className="h-3.5 w-3.5" />
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
