export interface ColorTheme {
  gradient: string;
  iconBg: string;
  iconText: string;
  cardBorder: string;
  cardBg: string;
  accentText: string;
  progressBar: string;
  progressTrack: string;
  ring: string;
  glow: string;
  dot: string;
  completedBg: string;
  completedBorder: string;
}

export const colorThemes: Record<string, ColorTheme> = {
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-500',
    iconText: 'text-blue-50',
    cardBorder: 'border-blue-200',
    cardBg: 'bg-blue-50/50',
    accentText: 'text-blue-700',
    progressBar: 'bg-blue-500',
    progressTrack: 'bg-blue-100',
    ring: 'ring-blue-400',
    glow: 'shadow-blue-500/20',
    dot: 'bg-blue-500',
    completedBg: 'bg-blue-50',
    completedBorder: 'border-blue-300',
  },
  teal: {
    gradient: 'from-teal-500 to-emerald-500',
    iconBg: 'bg-teal-500',
    iconText: 'text-teal-50',
    cardBorder: 'border-teal-200',
    cardBg: 'bg-teal-50/50',
    accentText: 'text-teal-700',
    progressBar: 'bg-teal-500',
    progressTrack: 'bg-teal-100',
    ring: 'ring-teal-400',
    glow: 'shadow-teal-500/20',
    dot: 'bg-teal-500',
    completedBg: 'bg-teal-50',
    completedBorder: 'border-teal-300',
  },
  amber: {
    gradient: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-500',
    iconText: 'text-amber-50',
    cardBorder: 'border-amber-200',
    cardBg: 'bg-amber-50/50',
    accentText: 'text-amber-700',
    progressBar: 'bg-amber-500',
    progressTrack: 'bg-amber-100',
    ring: 'ring-amber-400',
    glow: 'shadow-amber-500/20',
    dot: 'bg-amber-500',
    completedBg: 'bg-amber-50',
    completedBorder: 'border-amber-300',
  },
  rose: {
    gradient: 'from-rose-500 to-pink-500',
    iconBg: 'bg-rose-500',
    iconText: 'text-rose-50',
    cardBorder: 'border-rose-200',
    cardBg: 'bg-rose-50/50',
    accentText: 'text-rose-700',
    progressBar: 'bg-rose-500',
    progressTrack: 'bg-rose-100',
    ring: 'ring-rose-400',
    glow: 'shadow-rose-500/20',
    dot: 'bg-rose-500',
    completedBg: 'bg-rose-50',
    completedBorder: 'border-rose-300',
  },
  emerald: {
    gradient: 'from-emerald-500 to-green-600',
    iconBg: 'bg-emerald-500',
    iconText: 'text-emerald-50',
    cardBorder: 'border-emerald-200',
    cardBg: 'bg-emerald-50/50',
    accentText: 'text-emerald-700',
    progressBar: 'bg-emerald-500',
    progressTrack: 'bg-emerald-100',
    ring: 'ring-emerald-400',
    glow: 'shadow-emerald-500/20',
    dot: 'bg-emerald-500',
    completedBg: 'bg-emerald-50',
    completedBorder: 'border-emerald-300',
  },
};

export function getTheme(key: string): ColorTheme {
  return colorThemes[key] ?? colorThemes.blue;
}
