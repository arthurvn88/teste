'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { addSale, type PaymentMethod } from '@/lib/db'

const PAYMENT_METHODS: PaymentMethod[] = ['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito']

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30'

export function NewSaleForm({
  companyId,
  onCreated,
}: {
  companyId: string
  onCreated: () => void
}) {
  const [product, setProduct] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('Pix')
  const [datetime, setDatetime] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const value = Number.parseFloat(amount.replace(',', '.'))
    if (!product.trim()) return setError('Informe o nome do produto.')
    if (!Number.isFinite(value) || value <= 0) return setError('Informe um valor válido.')

    setSaving(true)
    try {
      await addSale({
        companyId,
        productName: product.trim(),
        amount: Number(value.toFixed(2)),
        paymentMethod: method,
        timestamp: datetime ? new Date(datetime).toISOString() : undefined,
      })
      setProduct('')
      setAmount('')
      setMethod('Pix')
      setDatetime('')
      onCreated()
    } catch {
      setError('Não foi possível registrar a venda.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
    >
      <h3 className="text-sm font-medium text-card-foreground">Registrar Nova Venda</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          Produto
          <input
            className={inputClass}
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Açaí 500ml"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          Preço (R$)
          <input
            className={inputClass}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="18,00"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          Forma de Pagamento
          <select
            className={inputClass}
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          Data/Hora (opcional)
          <input
            type="datetime-local"
            className={inputClass}
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
          />
        </label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto sm:self-start"
      >
        {saving ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Plus className="size-4" aria-hidden="true" />
        )}
        {saving ? 'Registrando...' : 'Registrar Venda'}
      </button>
    </form>
  )
}
