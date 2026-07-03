import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface RiskDistItem {
  name: string;
  value: number;
  color: string;
}

interface RiskDistributionChartProps {
  data: RiskDistItem[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLabels?: boolean;
}

export default function RiskDistributionChart({
  data,
  height = 180,
  innerRadius = 45,
  outerRadius = 70,
  showLabels = false,
}: RiskDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={3}
          label={showLabels ? ({ name, value }) => `${name}: ${value}` : undefined}
          labelLine={false}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => [`${v} users`]} />
      </PieChart>
    </ResponsiveContainer>
  );
}
