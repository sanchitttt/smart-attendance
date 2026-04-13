'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export interface Point {
  date: string;
}

export interface Series {
  course: string;
  values: number[];
  color: string;
}

export interface LineChartProps {
  points: Point[];
  series: Series[];
}

type ChartData = {
  date: string;
} & Record<string, number>;

export default function LineChartComponent({
  points,
  series
}: LineChartProps) {

  const data: ChartData[] = points.map((p, i) => {
    const formattedDate = new Date(p.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short"
    });

    const values = series.reduce<Record<string, number>>((acc, s) => {
      acc[s.course] = s.values[i] ?? 0; // safety
      return acc;
    }, {});

    return {
      date: formattedDate,
      ...values
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="4 6" stroke="rgba(148,163,184,0.25)" />
        <XAxis dataKey="date" stroke="#64748b" />
        <YAxis stroke="#64748b" />
        <Tooltip />

        {series.map((line) => (
          <Line
            key={line.course}
            type="monotone"
            dataKey={line.course}
            stroke={line.color}
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}