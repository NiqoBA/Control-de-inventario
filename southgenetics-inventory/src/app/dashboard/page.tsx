'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product, Transaction } from '@/types'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    totalValue: 0,
    recentTransactions: 0,
  })
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()

      try {
        // Obtener total de productos
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })

        // Obtener productos con stock bajo
        const { count: lowStockCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .lte('quantity', 'min_quantity')

        // Obtener productos con stock bajo para mostrar alertas
        const { data: lowStockData } = await supabase
          .from('products')
          .select('*')
          .lte('quantity', 'min_quantity')
          .order('quantity', { ascending: true })
          .limit(5)

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
        setLowStockProducts(lowStockData || [])
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            height: '3rem',
            width: '3rem',
            border: '4px solid rgb(218, 165, 32)',
            borderTop: '4px solid transparent',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6B7280', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Productos',
      value: stats.totalProducts,
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      color: 'linear-gradient(135deg, rgb(218, 165, 32) 0%, rgb(255, 193, 7) 100%)',
      delay: 0,
    },
    {
      title: 'Stock Bajo',
      value: stats.lowStock,
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
      color: 'linear-gradient(135deg, rgb(239, 68, 68) 0%, rgb(220, 38, 38) 100%)',
      delay: 100,
    },
    {
      title: 'Valor Total',
      value: `$${stats.totalValue.toLocaleString()}`,
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
      color: 'linear-gradient(135deg, rgb(34, 197, 94) 0%, rgb(22, 163, 74) 100%)',
      delay: 200,
    },
    {
      title: 'Transacciones (7 días)',
      value: stats.recentTransactions,
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(37, 99, 235) 100%)',
      delay: 300,
    },
  ]

  const quickActions = [
    {
      title: 'Agregar Producto',
      icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
      href: '/dashboard/products',
      color: 'linear-gradient(135deg, rgb(218, 165, 32) 0%, rgb(255, 193, 7) 100%)',
    },
    {
      title: 'Entrada de Stock',
      icon: 'M7 11l5-5m0 0l5 5m-5-5v12',
      href: '/dashboard/transactions',
      color: 'linear-gradient(135deg, rgb(34, 197, 94) 0%, rgb(22, 163, 74) 100%)',
    },
    {
      title: 'Salida de Stock',
      icon: 'M17 13l-5 5m0 0l-5-5m5 5V6',
      href: '/dashboard/transactions',
      color: 'linear-gradient(135deg, rgb(239, 68, 68) 0%, rgb(220, 38, 38) 100%)',
    },
  ]

  const recentActivities = [
    { action: 'Producto agregado', item: 'Reactivo PCR', time: 'Hace 2 horas' },
    { action: 'Stock actualizado', item: 'Tubos de ensayo', time: 'Hace 4 horas' },
    { action: 'Transacción registrada', item: 'Entrada de reactivos', time: 'Hace 6 horas' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Dashboard</h1>
        <p style={{ color: '#6B7280' }}>Resumen del inventario de SouthGenetics</p>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {statCards.map((stat, index) => (
          <div
            key={stat.title}
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                flexShrink: 0,
                width: '3rem',
                height: '3rem',
                background: stat.color,
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s'
              }}>
                <svg style={{ height: '1.5rem', width: '1.5rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <div style={{ marginLeft: '1rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6B7280', margin: 0 }}>{stat.title}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '2px solid rgba(239, 68, 68, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              background: 'linear-gradient(135deg, rgb(239, 68, 68) 0%, rgb(220, 38, 38) 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem'
            }}>
              <svg style={{ height: '1rem', width: '1rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#DC2626', margin: 0 }}>
              Alertas de Stock Bajo ({lowStockProducts.length})
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'rgba(239, 68, 68, 0.05)',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(239, 68, 68, 0.1)'
                }}
              >
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', margin: '0 0 0.25rem 0' }}>
                    {product.name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>
                    Stock actual: <strong style={{ color: '#DC2626' }}>{product.quantity}</strong> | 
                    Stock mínimo: <strong>{product.min_quantity}</strong>
                  </p>
                </div>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#DC2626',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  Crítico
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Acciones Rápidas</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          {quickActions.map((action, index) => (
            <button
              key={action.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem 1.5rem',
                background: action.color,
                color: 'white',
                fontWeight: '600',
                borderRadius: '0.75rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <svg style={{ marginRight: '0.75rem', height: '1.25rem', width: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
              </svg>
              {action.title}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Actividad Reciente</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {recentActivities.map((activity, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                background: 'rgba(249, 250, 251, 0.5)',
                borderRadius: '0.75rem',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.background = 'rgba(249, 250, 251, 0.8)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.background = 'rgba(249, 250, 251, 0.5)'
              }}
            >
              <div style={{
                width: '0.75rem',
                height: '0.75rem',
                background: 'rgb(218, 165, 32)',
                borderRadius: '50%',
                marginRight: '1rem',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}></div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', margin: 0 }}>{activity.action}</p>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>{activity.item}</p>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 