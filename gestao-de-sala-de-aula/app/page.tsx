'use client'

import { useState } from 'react'
import type { User } from '@/lib/db'
import { LoginView } from '@/components/login-view'
import { StudentDashboard } from '@/components/student-dashboard'
import { TeacherDashboard } from '@/components/teacher-dashboard'

/**
 * Controlador da Single Page Application.
 * Alterna entre Login, Painel do Aluno e Painel da Professora
 * conforme o usuário autenticado (mantido apenas em memória/estado).
 */
export default function Page() {
  const [user, setUser] = useState<User | null>(null)

  if (!user) {
    return <LoginView onAuth={setUser} />
  }

  const logout = () => setUser(null)

  return user.role === 'TEACHER' ? (
    <TeacherDashboard user={user} onLogout={logout} />
  ) : (
    <StudentDashboard user={user} onLogout={logout} />
  )
}
