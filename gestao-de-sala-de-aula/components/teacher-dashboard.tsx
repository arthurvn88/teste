'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Copy, Check, Loader2, Plus, Users, DoorOpen, Building2 } from 'lucide-react'
import {
  createClassroom,
  getClassrooms,
  getCompaniesByClassroom,
  getSalesByClassroom,
  getSalesByCompany,
  type Classroom,
  type Company,
  type Sale,
  type User,
} from '@/lib/db'
import { TopBar } from './top-bar'
import { SalesDashboard } from './sales-dashboard'
import { formatBRL } from '@/lib/metrics'

type View =
  | { type: 'master' }
  | { type: 'classroom'; classroom: Classroom }

export function TeacherDashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [view, setView] = useState<View>({ type: 'master' })

  return (
    <div className="min-h-screen">
      <TopBar title="Painel da Professora" subtitle={user.name} onLogout={onLogout} />
      <main className="mx-auto max-w-6xl px-4 py-6 lg:px-8">
        {view.type === 'master' ? (
          <MasterView onSelect={(classroom) => setView({ type: 'classroom', classroom })} />
        ) : (
          <ClassroomView classroom={view.classroom} onBack={() => setView({ type: 'master' })} />
        )}
      </main>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Visão principal: lista de salas + criação                                   */
/* -------------------------------------------------------------------------- */

function MasterView({ onSelect }: { onSelect: (c: Classroom) => void }) {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    const rooms = await getClassrooms()
    setClassrooms(rooms)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    await createClassroom(name.trim())
    setName('')
    await load()
    setCreating(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-end"
      >
        <label className="flex flex-1 flex-col gap-1.5 text-xs text-muted-foreground">
          Nova Sala de Aula
          <input
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Turma 3º Ano - Empreendedorismo"
          />
        </label>
        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {creating ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
          Criar Sala
        </button>
      </form>

      {loading ? (
        <Loading />
      ) : classrooms.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Nenhuma sala criada ainda. Crie a primeira acima.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((c) => (
            <ClassroomCard key={c.id} classroom={c} onSelect={() => onSelect(c)} />
          ))}
        </div>
      )}
    </div>
  )
}

function ClassroomCard({ classroom, onSelect }: { classroom: Classroom; onSelect: () => void }) {
  const [copied, setCopied] = useState(false)

  async function copyCode(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(classroom.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard indisponível */
    }
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/60"
    >
      <div className="flex items-center justify-between">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <DoorOpen className="size-5" aria-hidden="true" />
        </span>
        <span
          onClick={copyCode}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && copyCode(e as unknown as React.MouseEvent)}
          className="inline-flex items-center gap-1.5 rounded-md bg-background px-2 py-1 font-mono text-xs text-accent transition-colors hover:bg-secondary"
        >
          {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
          {classroom.code}
        </span>
      </div>
      <span className="font-medium text-card-foreground text-pretty">{classroom.name}</span>
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/* Visão da sala: agregado + lista de empresas + inspeção individual           */
/* -------------------------------------------------------------------------- */

function ClassroomView({ classroom, onBack }: { classroom: Classroom; onBack: () => void }) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [aggregatedSales, setAggregatedSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [inspected, setInspected] = useState<Company | null>(null)
  const [inspectedSales, setInspectedSales] = useState<Sale[]>([])
  const [inspecting, setInspecting] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      const [comps, sales] = await Promise.all([
        getCompaniesByClassroom(classroom.id),
        getSalesByClassroom(classroom.id),
      ])
      if (!active) return
      setCompanies(comps)
      setAggregatedSales(sales)
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [classroom.id])

  async function inspect(company: Company) {
    setInspected(company)
    setInspecting(true)
    const sales = await getSalesByCompany(company.id)
    setInspectedSales(sales)
    setInspecting(false)
  }

  const companyTotals = (companyId: string) =>
    aggregatedSales.filter((s) => s.company_id === companyId).reduce((sum, s) => sum + s.amount, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Todas as salas
        </button>
        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold text-foreground text-balance">{classroom.name}</span>
          <span className="font-mono text-xs text-accent">{classroom.code}</span>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
            {/* Lista de empresas */}
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                <Users className="size-4 text-accent" aria-hidden="true" />
                Empresas ({companies.length})
              </div>
              {companies.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma empresa cadastrada. Compartilhe o código{' '}
                  <span className="font-mono text-accent">{classroom.code}</span> com os alunos.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {companies.map((company) => {
                    const active = inspected?.id === company.id
                    return (
                      <li key={company.id}>
                        <button
                          type="button"
                          onClick={() => inspect(company)}
                          className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                            active
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border bg-background text-card-foreground hover:border-primary/50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Building2 className="size-4 text-muted-foreground" aria-hidden="true" />
                            {company.name}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {formatBRL(companyTotals(company.id))}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Card resumo do agregado */}
            <div className="flex flex-col justify-center gap-2 rounded-xl border border-border bg-card p-6">
              <span className="text-sm text-muted-foreground">Faturamento total da sala</span>
              <span className="font-mono text-3xl font-semibold text-card-foreground">
                {formatBRL(aggregatedSales.reduce((sum, s) => sum + s.amount, 0))}
              </span>
              <span className="text-xs text-muted-foreground">
                {aggregatedSales.length} vendas · {companies.length} empresas
              </span>
            </div>
          </div>

          {/* Dashboard: individual (inspeção) OU agregado da sala */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {inspected ? `Dashboard · ${inspected.name}` : 'Dashboard Agregado da Sala'}
              </h2>
              {inspected && (
                <button
                  type="button"
                  onClick={() => setInspected(null)}
                  className="text-sm text-accent transition-opacity hover:opacity-80"
                >
                  Ver agregado da sala
                </button>
              )}
            </div>
            {inspecting ? (
              <Loading />
            ) : (
              <SalesDashboard sales={inspected ? inspectedSales : aggregatedSales} />
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Loading() {
  return (
    <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      Carregando...
    </div>
  )
}
