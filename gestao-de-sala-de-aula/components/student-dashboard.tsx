'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { getCompany, getSalesByCompany, type Company, type Sale, type User } from '@/lib/db'
import { TopBar } from './top-bar'
import { NewSaleForm } from './new-sale-form'
import { SalesDashboard } from './sales-dashboard'

export function StudentDashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [company, setCompany] = useState<Company | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  // ISOLAMENTO DE DADOS: o aluno só consulta a própria empresa (user.company_id).
  const load = useCallback(async () => {
    if (!user.company_id) return
    const [comp, companySales] = await Promise.all([
      getCompany(user.company_id),
      getSalesByCompany(user.company_id),
    ])
    setCompany(comp)
    setSales(companySales)
    setLoading(false)
  }, [user.company_id])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="min-h-screen">
      <TopBar
        title={company?.name ?? 'Minha Empresa'}
        subtitle={`${user.name} · Painel do Aluno`}
        onLogout={onLogout}
      />
      <main className="mx-auto max-w-6xl px-4 py-6 lg:px-8">
        {loading ? (
          <LoadingState />
        ) : (
          <div className="flex flex-col gap-4">
            {user.company_id && <NewSaleForm companyId={user.company_id} onCreated={load} />}
            <SalesDashboard sales={sales} />
          </div>
        )}
      </main>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      Carregando painel...
    </div>
  )
}
