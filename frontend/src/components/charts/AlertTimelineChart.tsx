import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface AlertTrendPoint {
  date: string;
  low: number;
  medium: number;
  high: number;
  critical: number;
  total?: number;
}

interface AlertTimelineChartProps {
  data: AlertTrendPoint[];
  height?: number;
  showLegend?: boolean;
}

const COLORS = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#10B981',
};

export default function AlertTimelineChart({
  data,
  height = 220,
  showLegend = false,
}: AlertTimelineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
        <defs>
          {Object.entries(COLORS).map(([k, c]) => (
            <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={c} stopOpacity={0.3} />
              <stop offset="95%" stopColor={c} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip />
        {showLegend && <Legend wrapperStyle={{ fontSize: 11 }} />}
        <Area
          type="monotone"
          dataKey="critical"
          stackId="1"
          name="Critical"
          stroke={COLORS.critical}
          fill="url(#g-critical)"
        />
        <Area
          type="monotone"
          dataKey="high"
          stackId="1"
          name="High"
          stroke={COLORS.high}
          fill="url(#g-high)"
        />
        <Area
          type="monotone"
          dataKey="medium"
          stackId="1"
          name="Medium"
          stroke={COLORS.medium}
          fill="url(#g-medium)"
        />
        <Area
          type="monotone"
          dataKey="low"
          stackId="1"
          name="Low"
          stroke={COLORS.low}
          fill="url(#g-low)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
