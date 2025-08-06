import { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  icon,
  disabled,
  className = '',
  style,
  ...props 
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, rgb(218, 165, 32) 0%, rgb(255, 193, 7) 100%)',
          color: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: 'none'
        }
      case 'secondary':
        return {
          background: 'rgb(249, 250, 251)',
          color: 'rgb(55, 65, 81)',
          border: '1px solid rgb(229, 231, 235)'
        }
      case 'danger':
        return {
          background: 'linear-gradient(135deg, rgb(239, 68, 68) 0%, rgb(220, 38, 38) 100%)',
          color: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: 'none'
        }
      case 'success':
        return {
          background: 'linear-gradient(135deg, rgb(34, 197, 94) 0%, rgb(22, 163, 74) 100%)',
          color: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: 'none'
        }
      case 'outline':
        return {
          background: 'transparent',
          color: 'rgb(218, 165, 32)',
          border: '2px solid rgb(218, 165, 32)'
        }
      default:
        return {
          background: 'linear-gradient(135deg, rgb(218, 165, 32) 0%, rgb(255, 193, 7) 100%)',
          color: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: 'none'
        }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '0.5rem 0.75rem',
          fontSize: '0.875rem'
        }
      case 'md':
        return {
          padding: '0.75rem 1rem',
          fontSize: '0.875rem'
        }
      case 'lg':
        return {
          padding: '1rem 1.5rem',
          fontSize: '1rem'
        }
      default:
        return {
          padding: '0.75rem 1rem',
          fontSize: '0.875rem'
        }
    }
  }

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    borderRadius: '0.75rem',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'none',
    outline: 'none',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style
  }

  return (
    <button
      style={baseStyles}
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          if (variant === 'primary') {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgb(184, 134, 11) 0%, rgb(218, 165, 32) 100%)'
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(0)'
          if (variant === 'primary') {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgb(218, 165, 32) 0%, rgb(255, 193, 7) 100%)'
          }
        }
      }}
      {...props}
    >
      {loading && (
        <div style={{
          animation: 'spin 1s linear infinite',
          height: '1rem',
          width: '1rem',
          border: '2px solid currentColor',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          marginRight: '0.5rem'
        }}></div>
      )}
      {icon && !loading && (
        <span style={{ marginRight: '0.5rem' }}>
          {icon}
        </span>
      )}
      {children}
    </button>
  )
} 