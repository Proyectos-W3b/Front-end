interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

const colorFor = (value: number) => {
  if (value < 30) return { stroke: '#ef4444', text: 'text-red-600' };
  if (value < 70) return { stroke: '#f59e0b', text: 'text-amber-600' };
  return { stroke: '#10b981', text: 'text-emerald-600' };
};

export default function ProgressRing({ value, size = 96, strokeWidth = 8, label }: ProgressRingProps) {
  const pct = Math.min(Math.max(value, 0), 100);
  const { stroke, text } = colorFor(pct);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold tabular-nums ${text}`}>{pct}%</span>
        </div>
      </div>
      {label && <p className="text-[11px] font-medium text-slate-400">{label}</p>}
    </div>
  );
}
