import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UseSupabaseOptions<T> {
  table: string
  select?: string
  filters?: Record<string, unknown>
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
  onSuccess?: (data: T[]) => void
  onError?: (error: Error | null) => void
  enabled?: boolean
}

interface UseSupabaseResult<T> {
  data: T[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  create: (data: Partial<T>) => Promise<void>
  update: (id: string, data: Partial<T>) => Promise<void>
  delete: (id: string) => Promise<void>
}

export function useSupabase<T = Record<string, unknown>>(options: UseSupabaseOptions<T>): UseSupabaseResult<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    if (!options.enabled) return

    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from(options.table)
        .select(options.select || '*')

      // Aplicar filtros
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value)
          }
        })
      }

      // Aplicar ordenamiento
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true
        })
      }

      // Aplicar límite
      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data: result, error } = await query

      if (error) {
        setError(error)
        options.onError?.(error)
      } else {
        setData(result || [])
        options.onSuccess?.(result || [])
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      options.onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [options.enabled, options.table, options.select, options.filters, options.orderBy, options.limit, options.onError, options.onSuccess, supabase])

  const create = async (newData: Partial<T>) => {
    try {
      setError(null)
      const { error } = await supabase
        .from(options.table)
        .insert([newData])

      if (error) {
        setError(error)
        options.onError?.(error)
      } else {
        await fetchData() // Recargar datos
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      options.onError?.(error)
    }
  }

  const update = async (id: string, updateData: Partial<T>) => {
    try {
      setError(null)
      const { error } = await supabase
        .from(options.table)
        .update(updateData)
        .eq('id', id)

      if (error) {
        setError(error)
        options.onError?.(error)
      } else {
        await fetchData() // Recargar datos
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      options.onError?.(error)
    }
  }

  const deleteItem = async (id: string) => {
    try {
      setError(null)
      const { error } = await supabase
        .from(options.table)
        .delete()
        .eq('id', id)

      if (error) {
        setError(error)
        options.onError?.(error)
      } else {
        await fetchData() // Recargar datos
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      options.onError?.(error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    create,
    update,
    delete: deleteItem,
  }
}

// Hook específico para estadísticas del dashboard
export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    totalValue: 0,
    recentTransactions: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()

      // Obtener total de productos
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Obtener productos con stock bajo
      const { count: lowStockCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lte('quantity', 'min_quantity')

      // Obtener valor total del inventario
      const { data: products } = await supabase
        .from('products')
        .select('quantity, unit_price')

      const totalValue = products?.reduce((sum, product) => {
        return sum + (product.quantity * product.unit_price)
      }, 0) || 0

      // Obtener transacciones recientes (últimos 7 días)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { count: recentTransactionsCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString())

      setStats({
        totalProducts: productsCount || 0,
        lowStock: lowStockCount || 0,
        totalValue,
        recentTransactions: recentTransactionsCount || 0,
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
} 