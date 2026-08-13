import type { Sale } from './db'

export const CHART_COLORS = ['#7c3aed', '#06b6d4', '#22c55e', '#f59e0b', '#ec4899']

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function isToday(iso: string): boolean {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export interface DashboardStats {
  todayTotal: number
  averageTicket: number
  totalOrders: number
  activeProducts: number
}

export function computeStats(sales: Sale[]): DashboardStats {
  const todaySales = sales.filter((s) => isToday(s.timestamp))
  const todayTotal = todaySales.reduce((sum, s) => sum + s.amount, 0)
  const totalOrders = todaySales.length
  const averageTicket = totalOrders > 0 ? todayTotal / totalOrders : 0
  const activeProducts = new Set(sales.map((s) => s.product_name)).size
  return { todayTotal, averageTicket, totalOrders, activeProducts }
}

/** Agrupa vendas por hora (0-23) para o gráfico de linha. */
export function salesByHour(sales: Sale[]): { hour: string; total: number }[] {
  const buckets = new Map<number, number>()
  for (const s of sales.filter((x) => isToday(x.timestamp))) {
    const h = new Date(s.timestamp).getHours()
    buckets.set(h, (buckets.get(h) ?? 0) + s.amount)
  }
  const hours = Array.from(buckets.keys()).sort((a, b) => a - b)
  const start = hours.length ? hours[0] : 9
  const end = hours.length ? hours[hours.length - 1] : 18
  const result: { hour: string; total: number }[] = []
  for (let h = start; h <= end; h++) {
    result.push({ hour: `${String(h).padStart(2, '0')}h`, total: Number((buckets.get(h) ?? 0).toFixed(2)) })
  }
  return result
}

/** Distribui vendas por método de pagamento para o gráfico de pizza. */
export function salesByPaymentMethod(sales: Sale[]): { name: string; value: number }[] {
  const buckets = new Map<string, number>()
  for (const s of sales) {
    buckets.set(s.payment_method, (buckets.get(s.payment_method) ?? 0) + s.amount)
  }
  return Array.from(buckets.entries()).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2)),
  }))
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
