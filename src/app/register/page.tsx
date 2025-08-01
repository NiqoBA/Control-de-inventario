'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.')
    }

    setLoading(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '1rem',
      backgroundColor: 'rgb(218, 165, 32)'
    }}>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: '28rem' 
      }}>
        {/* Register Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '2rem'
        }}>
          {/* Logo and Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              margin: '0 auto',
              width: '4rem',
              height: '4rem',
              backgroundColor: 'rgb(218, 165, 32)',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              transition: 'transform 0.2s'
            }}>
              <svg style={{ height: '2rem', width: '2rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>SouthGenetics</h1>
            <p style={{ color: '#6B7280' }}>Crear cuenta</p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label htmlFor="name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Nombre completo
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '0.75rem',
                      backgroundColor: 'white',
                      color: '#111827',
                      fontSize: '1rem'
                    }}
                    placeholder="Tu nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Correo electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '0.75rem',
                      backgroundColor: 'white',
                      color: '#111827',
                      fontSize: '1rem'
                    }}
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '0.75rem',
                      backgroundColor: 'white',
                      color: '#111827',
                      fontSize: '1rem'
                    }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '0.75rem',
                padding: '1rem'
              }}>
                <div style={{ display: 'flex' }}>
                  <svg style={{ height: '1.25rem', width: '1.25rem', color: '#F87171' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p style={{ marginLeft: '0.75rem', fontSize: '0.875rem', color: '#DC2626' }}>{error}</p>
                </div>
              </div>
            )}

            {message && (
              <div style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '0.75rem',
                padding: '1rem'
              }}>
                <div style={{ display: 'flex' }}>
                  <svg style={{ height: '1.25rem', width: '1.25rem', color: '#4ADE80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p style={{ marginLeft: '0.75rem', fontSize: '0.875rem', color: '#16A34A' }}>{message}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgb(218, 165, 32)',
                color: 'white',
                fontWeight: '600',
                borderRadius: '0.75rem',
                fontSize: '1.125rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    animation: 'spin 1s linear infinite',
                    height: '1.25rem',
                    width: '1.25rem',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    marginRight: '0.5rem'
                  }}></div>
                  Creando cuenta...
                </div>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link 
              href="/login" 
              style={{
                color: 'rgb(218, 165, 32)',
                fontWeight: '500',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'color 0.2s'
              }}
            >
              ¿Ya tienes cuenta? Inicia sesión
              <svg style={{ marginLeft: '0.25rem', height: '1rem', width: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'white', fontSize: '0.875rem' }}>
          <p>© 2024 SouthGenetics. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
} 