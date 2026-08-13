'use client'

import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Sale } from '@/lib/db'
import { CHART_COLORS, formatBRL, salesByHour, salesByPaymentMethod } from '@/lib/metrics'

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-medium text-card-foreground">{title}</h3>
      <div className="h-64 w-full">{children}</div>
    </div>
  )
}

const tooltipStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '0.5rem',
  color: '#e2e8f0',
  fontSize: '12px',
}

export function SalesCharts({ sales }: { sales: Sale[] }) {
  const hourly = salesByHour(sales)
  const byMethod = salesByPaymentMethod(sales)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="Vendas por Hora (hoje)">
        {hourly.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourly} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="fillHour" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [formatBRL(v), 'Total']}
                cursor={{ stroke: '#7c3aed', strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#7c3aed"
                strokeWidth={2}
                fill="url(#fillHour)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </ChartCard>

      <ChartCard title="Formas de Pagamento">
        {byMethod.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={byMethod}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                stroke="none"
              >
                {byMethod.map((entry, i) => (
                  <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatBRL(v)} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </ChartCard>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Sem dados para exibir ainda.
    </div>
  )
}
