interface PercentageSliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

const colorFor = (value: number) => {
  if (value < 30) return { text: 'text-red-600', track: '#ef4444' };
  if (value < 70) return { text: 'text-amber-600', track: '#f59e0b' };
  return { text: 'text-emerald-600', track: '#10b981' };
};

export default function PercentageSlider({ value, onChange, label = 'Porcentaje de avance' }: PercentageSliderProps) {
  const { text, track } = colorFor(value);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="label !mb-0">{label}</span>
        <span className={`text-lg font-bold tabular-nums ${text}`}>{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-slider"
        style={{ background: `linear-gradient(to right, ${track} ${value}%, #e2e8f0 ${value}%)` }}
      />
      <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
