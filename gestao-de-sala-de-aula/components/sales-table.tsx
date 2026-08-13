'use client'

import type { Sale } from '@/lib/db'
import { formatBRL, formatTime } from '@/lib/metrics'

const methodStyles: Record<string, string> = {
  Pix: 'bg-[#06b6d4]/15 text-[#22d3ee]',
  Dinheiro: 'bg-[#22c55e]/15 text-[#4ade80]',
  'Cartão de Crédito': 'bg-[#7c3aed]/15 text-[#a78bfa]',
  'Cartão de Débito': 'bg-[#f59e0b]/15 text-[#fbbf24]',
}

export function SalesTable({ sales }: { sales: Sale[] }) {
  const latest = sales.slice(0, 10)

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-medium text-card-foreground">Últimas Vendas</h3>
      {latest.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nenhuma venda registrada ainda.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3 font-medium">Produto</th>
                <th className="pb-3 font-medium">Valor</th>
                <th className="pb-3 font-medium">Pagamento</th>
                <th className="pb-3 text-right font-medium">Horário</th>
              </tr>
            </thead>
            <tbody>
              {latest.map((s) => (
                <tr key={s.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 text-card-foreground">{s.product_name}</td>
                  <td className="py-3 font-mono text-card-foreground">{formatBRL(s.amount)}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                        methodStyles[s.payment_method] ?? 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {s.payment_method}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono text-muted-foreground">
                    {formatTime(s.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
