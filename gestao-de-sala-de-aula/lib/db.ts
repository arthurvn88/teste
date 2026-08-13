/**
 * ============================================================================
 * CAMADA DE DADOS SIMULADA (MOCK API LAYER)
 * ============================================================================
 * Banco de dados em memória que simula tabelas relacionais.
 * Todas as operações são funções `async` isoladas com delay de rede simulado.
 *
 * Para conectar a um backend real (Supabase / Firebase / Node.js), basta
 * substituir o corpo de cada função marcada com:
 *   // TODO: Replace with real API/Database call
 * mantendo a mesma assinatura (entrada/saída).
 * ============================================================================
 */

export type Role = 'TEACHER' | 'STUDENT'
export type PaymentMethod = 'Pix' | 'Dinheiro' | 'Cartão de Crédito' | 'Cartão de Débito'

export interface Classroom {
  id: string
  name: string
  code: string
}

export interface Company {
  id: string
  classroom_id: string
  name: string
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
  company_id: string | null
}

export interface Sale {
  id: string
  company_id: string
  product_name: string
  amount: number
  payment_method: PaymentMethod
  timestamp: string // ISO string
}

interface DbState {
  classrooms: Classroom[]
  companies: Company[]
  users: User[]
  sales: Sale[]
}

/**
 * Estado global em memória. Persiste enquanto a aba estiver aberta.
 * TODO: Replace with real API/Database call (isto será substituído pelo banco real).
 */
const dbState: DbState = {
  classrooms: [],
  companies: [],
  users: [],
  sales: [],
}

/* -------------------------------------------------------------------------- */
/* Utilitários internos                                                        */
/* -------------------------------------------------------------------------- */

const NETWORK_DELAY = 500

/** Simula a latência de uma chamada de rede. */
function delay<T>(data: T, ms: number = NETWORK_DELAY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredCloneSafe(data)), ms))
}

/** Clone defensivo para evitar mutações externas no estado. */
function structuredCloneSafe<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

/** Gera um código de sala aleatório no formato SALA-XXXX. */
function generateClassroomCode(): string {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `SALA-${n}`
}

/* -------------------------------------------------------------------------- */
/* SEED — dados iniciais de demonstração para a visão da professora           */
/* (empresas de alunos NÃO são hardcoded no fluxo de cadastro; isto é apenas  */
/*  um conjunto de exemplo para o preview não iniciar vazio)                  */
/* -------------------------------------------------------------------------- */

function seed() {
  if (dbState.classrooms.length > 0) return

  const classroom: Classroom = { id: uid('room'), name: 'Turma 3º Ano - Empreendedorismo', code: 'SALA-8842' }
  dbState.classrooms.push(classroom)

  const demoCompanies = ['Açaí do Léo', 'Sabor Tropical', 'Point do Açaí']
  demoCompanies.forEach((name, i) => {
    const company: Company = { id: uid('comp'), classroom_id: classroom.id, name }
    dbState.companies.push(company)
    dbState.users.push({
      id: uid('user'),
      name: `Aluno ${i + 1}`,
      email: `aluno${i + 1}@escola.com`,
      role: 'STUDENT',
      company_id: company.id,
    })

    // Vendas de exemplo espalhadas ao longo do dia de hoje
    const products = ['Açaí 300ml', 'Açaí 500ml', 'Copo da Casa', 'Barca de Açaí']
    const methods: PaymentMethod[] = ['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito']
    const count = 6 + Math.floor(Math.random() * 8)
    for (let s = 0; s < count; s++) {
      const d = new Date()
      d.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0)
      dbState.sales.push({
        id: uid('sale'),
        company_id: company.id,
        product_name: products[Math.floor(Math.random() * products.length)],
        amount: Number((8 + Math.random() * 22).toFixed(2)),
        payment_method: methods[Math.floor(Math.random() * methods.length)],
        timestamp: d.toISOString(),
      })
    }
  })

  // Professora de demonstração
  dbState.users.push({
    id: uid('user'),
    name: 'Professora Demo',
    email: 'professora@escola.com',
    role: 'TEACHER',
    company_id: null,
  })
}

seed()

/* ========================================================================== */
/* API — AUTENTICAÇÃO                                                          */
/* ========================================================================== */

/** Login/entrada da professora (mock, sem senha). */
export async function loginTeacher(name: string, email: string): Promise<User> {
  // TODO: Replace with real API/Database call
  const existing = dbState.users.find((u) => u.email === email && u.role === 'TEACHER')
  if (existing) return delay(existing)

  const teacher: User = { id: uid('user'), name, email, role: 'TEACHER', company_id: null }
  dbState.users.push(teacher)
  return delay(teacher)
}

/** Login de aluno existente pelo e-mail. */
export async function loginStudent(email: string): Promise<User | null> {
  // TODO: Replace with real API/Database call
  const user = dbState.users.find((u) => u.email === email && u.role === 'STUDENT') ?? null
  return delay(user)
}

/* ========================================================================== */
/* API — SALAS DE AULA (CLASSROOMS)                                            */
/* ========================================================================== */

/** Cria uma nova sala com código de acesso único. */
export async function createClassroom(name: string): Promise<Classroom> {
  // TODO: Replace with real API/Database call
  let code = generateClassroomCode()
  while (dbState.classrooms.some((c) => c.code === code)) {
    code = generateClassroomCode()
  }
  const classroom: Classroom = { id: uid('room'), name, code }
  dbState.classrooms.push(classroom)
  return delay(classroom)
}

/** Lista todas as salas (visão da professora). */
export async function getClassrooms(): Promise<Classroom[]> {
  // TODO: Replace with real API/Database call
  return delay(dbState.classrooms)
}

/** Busca uma sala pelo código de acesso. */
export async function getClassroomByCode(code: string): Promise<Classroom | null> {
  // TODO: Replace with real API/Database call
  const room = dbState.classrooms.find((c) => c.code.toUpperCase() === code.trim().toUpperCase()) ?? null
  return delay(room)
}

/* ========================================================================== */
/* API — EMPRESAS (COMPANIES)                                                  */
/* ========================================================================== */

/**
 * Cadastra um aluno e sua empresa em uma sala existente.
 * Valida o código da sala antes de criar os registros.
 */
export async function registerCompany(input: {
  studentName: string
  email: string
  companyName: string
  classroomCode: string
}): Promise<{ user: User; company: Company }> {
  // TODO: Replace with real API/Database call
  const room = dbState.classrooms.find(
    (c) => c.code.toUpperCase() === input.classroomCode.trim().toUpperCase(),
  )
  if (!room) throw new Error('Código de sala inválido. Verifique com a professora.')

  const emailTaken = dbState.users.some((u) => u.email === input.email)
  if (emailTaken) throw new Error('Este e-mail já está cadastrado.')

  const company: Company = { id: uid('comp'), classroom_id: room.id, name: input.companyName }
  dbState.companies.push(company)

  const user: User = {
    id: uid('user'),
    name: input.studentName,
    email: input.email,
    role: 'STUDENT',
    company_id: company.id,
  }
  dbState.users.push(user)

  return delay({ user, company })
}

/** Lista todas as empresas de uma sala (visão da professora). */
export async function getCompaniesByClassroom(classroomId: string): Promise<Company[]> {
  // TODO: Replace with real API/Database call
  const companies = dbState.companies.filter((c) => c.classroom_id === classroomId)
  return delay(companies)
}

/** Busca uma empresa específica pelo id. */
export async function getCompany(companyId: string): Promise<Company | null> {
  // TODO: Replace with real API/Database call
  const company = dbState.companies.find((c) => c.id === companyId) ?? null
  return delay(company)
}

/* ========================================================================== */
/* API — VENDAS (SALES)                                                        */
/* ========================================================================== */

/**
 * Busca as vendas de UMA empresa (isolamento de dados do aluno).
 * Um aluno só consegue acessar as vendas da própria empresa.
 */
export async function getSalesByCompany(companyId: string): Promise<Sale[]> {
  // TODO: Replace with real API/Database call
  const sales = dbState.sales
    .filter((s) => s.company_id === companyId)
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
  return delay(sales)
}

/**
 * Busca as vendas AGREGADAS de todas as empresas de uma sala (visão da professora).
 */
export async function getSalesByClassroom(classroomId: string): Promise<Sale[]> {
  // TODO: Replace with real API/Database call
  const companyIds = dbState.companies.filter((c) => c.classroom_id === classroomId).map((c) => c.id)
  const sales = dbState.sales
    .filter((s) => companyIds.includes(s.company_id))
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
  return delay(sales)
}

/** Registra uma nova venda para uma empresa. */
export async function addSale(input: {
  companyId: string
  productName: string
  amount: number
  paymentMethod: PaymentMethod
  timestamp?: string
}): Promise<Sale> {
  // TODO: Replace with real API/Database call
  const sale: Sale = {
    id: uid('sale'),
    company_id: input.companyId,
    product_name: input.productName,
    amount: input.amount,
    payment_method: input.paymentMethod,
    timestamp: input.timestamp ?? new Date().toISOString(),
  }
  dbState.sales.push(sale)
  return delay(sale, 300)
}
