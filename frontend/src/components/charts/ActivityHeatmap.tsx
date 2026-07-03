interface HourlyDataPoint {
  day: string;
  hour: number;
  value: number;
}

interface ActivityHeatmapProps {
  data: HourlyDataPoint[];
}

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const hourlyMax = data.length > 0 ? Math.max(...data.map((h) => h.value)) : 1;
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const heatColor = (v: number) => {
    const ratio = v / hourlyMax;
    if (ratio < 0.2) return 'rgba(16,185,129,0.15)';
    if (ratio < 0.4) return 'rgba(245,158,11,0.2)';
    if (ratio < 0.7) return 'rgba(249,115,22,0.35)';
    return 'rgba(239,68,68,0.5)';
  };

  return (
    <div className="mt-3 overflow-x-auto">
      <div className="flex gap-1 mb-1">
        <div className="w-8" />
        {HOURS.filter((h) => h % 4 === 0).map((h) => (
          <div key={h} className="text-[9px] text-slate-600 w-5 text-center">
            {h}h
          </div>
        ))}
      </div>
      {DAYS.map((day) => (
        <div key={day} className="flex items-center gap-1 mb-1">
          <div className="text-[9px] text-slate-500 w-8 text-right pr-1">
            {day}
          </div>
          {HOURS.map((hour) => {
            const point = data.find((h) => h.day === day && h.hour === hour);
            const val = point?.value ?? 0;
            return (
              <div
                key={hour}
                title={`${day} ${hour}:00 — ${val} events`}
                className="w-5 h-5 rounded-sm transition-all hover:scale-125 cursor-pointer"
                style={{ background: heatColor(val) }}
              />
            );
          })}
        </div>
      ))}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[9px] text-slate-600">Low</span>
        {[
          'rgba(16,185,129,0.15)',
          'rgba(245,158,11,0.2)',
          'rgba(249,115,22,0.35)',
          'rgba(239,68,68,0.5)',
        ].map((c, i) => (
          <div key={i} className="w-4 h-4 rounded-sm" style={{ background: c }} />
        ))}
        <span className="text-[9px] text-slate-600">High</span>
      </div>
    </div>
  );
}
