'use client'

import { useState } from 'react'
import { GraduationCap, Store, Loader2, Sparkles } from 'lucide-react'
import { loginStudent, loginTeacher, registerCompany, type User } from '@/lib/db'

type Tab = 'teacher' | 'student'
type StudentMode = 'register' | 'login'

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30'

export function LoginView({ onAuth }: { onAuth: (user: User) => void }) {
  const [tab, setTab] = useState<Tab>('student')

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Sparkles className="size-7" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Gestão de Vendas Escolar
          </h1>
          <p className="text-sm text-muted-foreground text-pretty">
            Professoras criam salas, alunos cadastram suas empresas e acompanham as vendas em tempo real.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl border border-border bg-card p-1.5">
          <TabButton active={tab === 'student'} onClick={() => setTab('student')} icon={Store}>
            Sou Aluno
          </TabButton>
          <TabButton active={tab === 'teacher'} onClick={() => setTab('teacher')} icon={GraduationCap}>
            Sou Professora
          </TabButton>
        </div>

        {tab === 'teacher' ? (
          <TeacherForm onAuth={onAuth} />
        ) : (
          <StudentForm onAuth={onAuth} />
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Sala de demonstração: <span className="font-mono text-accent">SALA-8842</span>
        </p>
      </div>
    </main>
  )
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: typeof Store
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className="size-4" aria-hidden="true" />
      {children}
    </button>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">{children}</div>
  )
}

function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

function TeacherForm({ onAuth }: { onAuth: (user: User) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim()) return setError('Preencha nome e e-mail.')
    setLoading(true)
    try {
      const user = await loginTeacher(name.trim(), email.trim())
      onAuth(user)
    } catch {
      setError('Não foi possível entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          Nome
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
        </label>
        <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          E-mail
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="professora@escola.com"
          />
        </label>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <SubmitButton loading={loading}>Entrar como Professora</SubmitButton>
      </form>
    </Card>
  )
}

function StudentForm({ onAuth }: { onAuth: (user: User) => void }) {
  const [mode, setMode] = useState<StudentMode>('register')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        if (!name.trim() || !email.trim() || !companyName.trim() || !code.trim()) {
          setLoading(false)
          return setError('Preencha todos os campos.')
        }
        const { user } = await registerCompany({
          studentName: name.trim(),
          email: email.trim(),
          companyName: companyName.trim(),
          classroomCode: code.trim(),
        })
        onAuth(user)
      } else {
        if (!email.trim()) {
          setLoading(false)
          return setError('Informe o e-mail cadastrado.')
        }
        const user = await loginStudent(email.trim())
        if (!user) {
          setLoading(false)
          return setError('E-mail não encontrado. Cadastre sua empresa primeiro.')
        }
        onAuth(user)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-background p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
            mode === 'register' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'
          }`}
        >
          Cadastrar Empresa
        </button>
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
            mode === 'login' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'
          }`}
        >
          Já tenho conta
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === 'register' && (
          <>
            <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              Nome do Aluno
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
            </label>
            <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              Nome da Empresa
              <input
                className={inputClass}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Açaí do Léo"
              />
            </label>
          </>
        )}

        <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          E-mail
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@escola.com"
          />
        </label>

        {mode === 'register' && (
          <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            Código da Sala
            <input
              className={`${inputClass} font-mono uppercase`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SALA-8842"
            />
          </label>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
        <SubmitButton loading={loading}>
          {mode === 'register' ? 'Cadastrar e Entrar' : 'Entrar'}
        </SubmitButton>
      </form>
    </Card>
  )
}
