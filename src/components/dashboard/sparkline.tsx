"use client";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

export function Sparkline({ data, color = "#ef4444" }: { data: number[]; color?: string }) {
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <div className="h-8 w-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
