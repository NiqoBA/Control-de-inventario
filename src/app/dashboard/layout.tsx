'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        if (event === 'SIGNED_OUT') {
          router.push('/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgb(249, 250, 251) 0%, rgb(255, 255, 255) 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            height: '4rem',
            width: '4rem',
            border: '4px solid rgb(218, 165, 32)',
            borderTop: '4px solid transparent',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6B7280', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z' },
    { href: '/dashboard/products', label: 'Productos', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { href: '/dashboard/categories', label: 'Categorías', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
    { href: '/dashboard/transactions', label: 'Transacciones', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { href: '/dashboard/suppliers', label: 'Proveedores', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { href: '/dashboard/employees', label: 'Empleados', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { href: '/dashboard/stock-requests', label: 'Solicitudes de Stock', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgb(249, 250, 251) 0%, rgb(255, 255, 255) 100%)'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(218, 165, 32, 0.1)'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <svg style={{ height: '1.5rem', width: '1.5rem', color: '#374151' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  background: 'linear-gradient(135deg, rgb(218, 165, 32) 0%, rgb(255, 193, 7) 100%)',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s'
                }}>
                  <svg style={{ height: '1.5rem', width: '1.5rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>SouthGenetics</h1>
                  <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>Control de Inventario</p>
                </div>
              </div>
            </div>

            {/* User menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'none', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#374151' }}>
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  background: 'linear-gradient(135deg, rgb(218, 165, 32) 0%, rgb(255, 193, 7) 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: 'white', fontWeight: '600', fontSize: '0.75rem' }}>
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span>{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, rgb(218, 165, 32) 0%, rgb(255, 193, 7) 100%)',
                  color: 'white',
                  fontWeight: '500',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgb(184, 134, 11) 0%, rgb(218, 165, 32) 100%)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgb(218, 165, 32) 0%, rgb(255, 193, 7) 100%)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <aside style={{
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          width: '16rem',
          height: '100vh',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ flex: 1, padding: '1.5rem 1rem' }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {navigationItems.map((item, index) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: isActive ? 'white' : '#374151',
                      borderRadius: '0.75rem',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease-in-out',
                      background: isActive ? 'rgb(218, 165, 32)' : 'transparent',
                      transform: isActive ? 'translateX(4px)' : 'translateX(0)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(218, 165, 32, 0.1)'
                        e.currentTarget.style.color = 'rgb(218, 165, 32)'
                        e.currentTarget.style.transform = 'translateX(4px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = '#374151'
                        e.currentTarget.style.transform = 'translateX(0)'
                      }
                    }}
                  >
                    <svg style={{ 
                      marginRight: '0.75rem', 
                      height: '1.25rem', 
                      width: '1.25rem',
                      transition: 'transform 0.2s'
                    }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Sidebar footer */}
          <div style={{ padding: '1rem', borderTop: '1px solid #E5E7EB' }}>
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#6B7280' }}>
              <p style={{ margin: 0 }}>SouthGenetics v1.0</p>
              <p style={{ margin: '0.25rem 0 0 0' }}>Sistema de Inventario</p>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(4px)',
              zIndex: 40
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main style={{ 
          flex: 1, 
          padding: '1.5rem 2rem',
          marginLeft: sidebarOpen ? '16rem' : '0',
          transition: 'margin-left 0.3s ease-in-out'
        }}>
          <div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 