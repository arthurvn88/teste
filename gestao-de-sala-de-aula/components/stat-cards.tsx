'use client'

import { DollarSign, Receipt, ShoppingBag, Package } from 'lucide-react'
import type { DashboardStats } from '@/lib/metrics'
import { formatBRL } from '@/lib/metrics'

const items = [
  { key: 'todayTotal', label: 'Vendas de Hoje', icon: DollarSign, accent: '#7c3aed', money: true },
  { key: 'averageTicket', label: 'Ticket Médio', icon: Receipt, accent: '#06b6d4', money: true },
  { key: 'totalOrders', label: 'Total de Pedidos', icon: ShoppingBag, accent: '#22c55e', money: false },
  { key: 'activeProducts', label: 'Produtos Ativos', icon: Package, accent: '#f59e0b', money: false },
] as const

export function StatCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map(({ key, label, icon: Icon, accent, money }) => (
        <div
          key={key}
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground text-pretty">{label}</span>
            <span
              className="flex size-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${accent}20`, color: accent }}
            >
              <Icon className="size-5" aria-hidden="true" />
            </span>
          </div>
          <span className="font-mono text-2xl font-semibold tracking-tight text-card-foreground">
            {money ? formatBRL(stats[key]) : stats[key]}
          </span>
        </div>
      ))}
    </div>
  )
}
