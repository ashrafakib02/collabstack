"use client"

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AnalyticsChartsProps {
  todoTasks: number
  inProgressTasks: number
  doneTasks: number
  totalTasks: number
  totalProjects: number
  totalWorkspaces: number
}

export function AnalyticsCharts({
  todoTasks,
  inProgressTasks,
  doneTasks,
  totalTasks,
  totalProjects,
  totalWorkspaces,
}: AnalyticsChartsProps) {
  // Task Status Distribution Data
  const taskStatusData = [
    {
      name: "Todo",
      value: todoTasks,
      fill: "hsl(var(--chart-1))",
    },
    {
      name: "In Progress",
      value: inProgressTasks,
      fill: "hsl(var(--chart-3))",
    },
    {
      name: "Done",
      value: doneTasks,
      fill: "hsl(var(--chart-2))",
    },
  ]

  // Productivity Trend Data (simulated last 7 days)
  const productivityTrendData = [
    { day: "Mon", completed: 3, inProgress: 2 },
    { day: "Tue", completed: 5, inProgress: 3 },
    { day: "Wed", completed: 4, inProgress: 4 },
    { day: "Thu", completed: 6, inProgress: 2 },
    { day: "Fri", completed: 7, inProgress: 3 },
    { day: "Sat", completed: 2, inProgress: 1 },
    { day: "Sun", completed: doneTasks, inProgress: inProgressTasks },
  ]

  // Workspace & Projects Distribution
  const resourcesData = [
    {
      name: "Workspaces",
      count: totalWorkspaces,
      fill: "hsl(var(--chart-4))",
    },
    {
      name: "Projects",
      count: totalProjects,
      fill: "hsl(var(--chart-5))",
    },
  ]

  // Task completion percentage
  const completionPercentage =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Task Status Pie Chart */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold text-card-foreground">
          Task Status Distribution
        </h3>
        {totalTasks > 0 ? (
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => `${value} tasks`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No tasks to display
          </div>
        )}
        <div className="mt-4 space-y-2">
          {taskStatusData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
              <span className="font-semibold text-card-foreground">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Productivity Trend Line Chart */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:col-span-2 lg:col-span-1">
        <h3 className="mb-6 text-lg font-semibold text-card-foreground">
          Weekly Productivity Trend
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={productivityTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="day"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
              activeDot={{ r: 6 }}
              name="Completed"
            />
            <Line
              type="monotone"
              dataKey="inProgress"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-3))", r: 4 }}
              activeDot={{ r: 6 }}
              name="In Progress"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Completion Rate */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold text-card-foreground">
          Completion Rate
        </h3>
        <div className="flex flex-col items-center justify-center">
          <div className="relative h-40 w-40">
            <svg
              className="h-40 w-40 -rotate-90 transform"
              viewBox="0 0 160 160"
            >
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="hsl(var(--chart-2))"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${440 * (completionPercentage / 100)} 440`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-card-foreground">
                {completionPercentage}%
              </span>
              <span className="text-xs text-muted-foreground">Complete</span>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {doneTasks} of {totalTasks} tasks completed
            </p>
          </div>
        </div>
      </div>

      {/* Resources Overview Bar Chart */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:col-span-2 lg:col-span-2">
        <h3 className="mb-6 text-lg font-semibold text-card-foreground">
          Resources Overview
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={resourcesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value) => `${value} items`}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {resourcesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Stats */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold text-card-foreground">
          Quick Stats
        </h3>
        <div className="space-y-4">
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Total Tasks
            </p>
            <p className="mt-2 text-3xl font-bold text-card-foreground">
              {totalTasks}
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Active Tasks
            </p>
            <p className="mt-2 text-3xl font-bold text-card-foreground">
              {inProgressTasks}
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Avg per Project
            </p>
            <p className="mt-2 text-3xl font-bold text-card-foreground">
              {totalProjects > 0 ? (totalTasks / totalProjects).toFixed(1) : 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
