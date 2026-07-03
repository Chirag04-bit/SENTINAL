import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface ThreatTypeItem {
  name: string;
  count: number;
  percentage?: number;
}

interface ThreatTypesChartProps {
  data: ThreatTypeItem[];
  height?: number;
  yAxisWidth?: number;
  radius?: [number, number, number, number];
}

const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#06B6D4', '#4F46E5', '#10B981'];

export default function ThreatTypesChart({
  data,
  height = 200,
  yAxisWidth = 110,
  radius = [0, 4, 4, 0],
}: ThreatTypesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10 }} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={yAxisWidth} />
        <Tooltip formatter={(v: any) => [`${v} alerts`, 'Count']} />
        <Bar dataKey="count" radius={radius}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
