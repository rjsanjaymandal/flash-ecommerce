'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

interface RevenueChartProps {
  data: { name: string; total: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
      return <div className="h-[350px] flex items-center justify-center text-muted-foreground">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.3} />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
             cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
             contentStyle={{ 
                 backgroundColor: 'hsl(var(--background))', 
                 borderColor: 'hsl(var(--border))',
                 borderRadius: '8px' 
             }}
             itemStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
