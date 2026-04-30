"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#6366f1",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export function DashboardCharts({
  attendanceHistory,
  classBreakdown,
  deptBreakdown,
}: {
  attendanceHistory: any[];
  classBreakdown: Record<string, number>;
  deptBreakdown: Record<string, number>;
}) {
  const attendanceData = attendanceHistory.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
    rate: Math.round(d.rate),
  }));

  const enrollmentData = Object.entries(classBreakdown).map(
    ([name, value]) => ({
      name,
      value,
    }),
  );

  const workforceData = Object.entries(deptBreakdown).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Attendance Trend */}
      <Card className="border-none shadow-sm glass overflow-hidden rounded-[2rem]">
        <CardHeader className="p-8 pb-0">
          <CardTitle className="text-2xl font-black font-outfit">
            Attendance Trend
          </CardTitle>
          <CardDescription className="font-medium">
            Daily presence rate for the last 7 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 600, fill: "#64748b" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 600, fill: "#64748b" }}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    padding: "12px",
                    fontWeight: "bold",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRate)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Distribution */}
      <Card className="border-none shadow-sm glass overflow-hidden rounded-[2rem]">
        <CardHeader className="p-8 pb-0">
          <CardTitle className="text-2xl font-black font-outfit">
            Enrollment Mix
          </CardTitle>
          <CardDescription className="font-medium">
            Students distributed across classes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={enrollmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {enrollmentData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: "20px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
