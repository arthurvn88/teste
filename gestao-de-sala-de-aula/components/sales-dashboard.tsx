'use client'

import type { Sale } from '@/lib/db'
import { computeStats } from '@/lib/metrics'
import { StatCards } from './stat-cards'
import { SalesCharts } from './sales-charts'
import { SalesTable } from './sales-table'

/**
 * Bloco reutilizável de dashboard de vendas.
 * Usado tanto pelo aluno (própria empresa) quanto pela professora
 * (empresa individual ou agregado da sala).
 */
export function SalesDashboard({ sales }: { sales: Sale[] }) {
  const stats = computeStats(sales)
  return (
    <div className="flex flex-col gap-4">
      <StatCards stats={stats} />
      <SalesCharts sales={sales} />
      <SalesTable sales={sales} />
    </div>
  )
}
