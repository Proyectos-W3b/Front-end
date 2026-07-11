interface SparklinePoint {
  fecha: string;
  porcentajeAvance: number;
}

interface SparklineProps {
  data: SparklinePoint[];
  width?: number;
  height?: number;
}

const PAD_X = 8;
const PAD_TOP = 14;
const PAD_BOTTOM = 4;

export default function Sparkline({ data, width = 240, height = 56 }: SparklineProps) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center text-xs text-slate-400" style={{ width, height }}>
        Necesitas al menos 2 actualizaciones para ver la tendencia
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  const innerW = width - PAD_X * 2;
  const innerH = height - PAD_TOP - PAD_BOTTOM;
  const stepX = innerW / (sorted.length - 1);

  const points = sorted.map((d, i) => ({
    x: PAD_X + i * stepX,
    y: PAD_TOP + innerH - (Math.min(Math.max(d.porcentajeAvance, 0), 100) / 100) * innerH,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${PAD_TOP + innerH} L ${points[0].x} ${PAD_TOP + innerH} Z`;
  const last = points[points.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <line x1={PAD_X} y1={PAD_TOP + innerH} x2={width - PAD_X} y2={PAD_TOP + innerH}
        stroke="currentColor" className="text-slate-100" strokeWidth={1} />
      <path d={areaPath} fill="#3b82f6" fillOpacity={0.1} />
      <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 3}
          fill="#3b82f6" stroke="white" strokeWidth={2}>
          <title>{new Date(p.fecha).toLocaleDateString('es')}: {p.porcentajeAvance}%</title>
        </circle>
      ))}
      <text x={last.x} y={last.y - 8} textAnchor="end" className="fill-slate-600 text-[10px] font-semibold tabular-nums">
        {last.porcentajeAvance}%
      </text>
    </svg>
  );
}
