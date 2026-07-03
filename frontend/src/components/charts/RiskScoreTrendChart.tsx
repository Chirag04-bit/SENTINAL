import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface RiskScorePoint {
  day: string;
  score: number;
}

interface RiskScoreTrendChartProps {
  data: RiskScorePoint[];
  height?: number;
}

export default function RiskScoreTrendChart({ data, height = 140 }: RiskScoreTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Tooltip formatter={(v: any) => [`${v} / 100`, 'Risk Score']} />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#10B981"
          fill="url(#scoreGrad)"
          strokeWidth={2}
          dot={{ fill: '#10B981', r: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
