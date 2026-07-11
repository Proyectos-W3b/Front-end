interface ProgressBarProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const colorFor = (value: number) => {
  if (value < 30) return { bar: 'bg-red-500',     text: 'text-red-600'     };
  if (value < 70) return { bar: 'bg-amber-500',   text: 'text-amber-600'   };
  return               { bar: 'bg-emerald-500', text: 'text-emerald-600' };
};

const HEIGHTS = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

export default function ProgressBar({ value, size = 'md', showLabel = false }: ProgressBarProps) {
  const pct = Math.min(Math.max(value, 0), 100);
  const { bar, text } = colorFor(pct);

  return (
    <div className="flex items-center gap-2.5 w-full">
      <div className={`flex-1 bg-slate-100 rounded-full overflow-hidden ${HEIGHTS[size]}`}>
        <div className={`${bar} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && (
        <span className={`text-xs font-semibold tabular-nums shrink-0 ${text}`}>{pct}%</span>
      )}
    </div>
  );
}
