import { HTMLAttributes } from 'react'

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  color?: 'mustard' | 'white' | 'gray'
  text?: string
}

export default function LoadingSpinner({ size = 'md', color = 'mustard', text, ...props }: LoadingSpinnerProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { height: '1rem', width: '1rem' }
      case 'md':
        return { height: '2rem', width: '2rem' }
      case 'lg':
        return { height: '3rem', width: '3rem' }
      default:
        return { height: '2rem', width: '2rem' }
    }
  }

  const getColorStyles = () => {
    switch (color) {
      case 'mustard':
        return { borderColor: 'rgb(218, 165, 32)' }
      case 'white':
        return { borderColor: 'white' }
      case 'gray':
        return { borderColor: '#D1D5DB' }
      default:
        return { borderColor: 'rgb(218, 165, 32)' }
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      ...props.style
    }} {...props}>
      <div style={{
        animation: 'spin 1s linear infinite',
        borderRadius: '50%',
        border: '2px solid transparent',
        borderTop: '2px solid',
        ...getSizeStyles(),
        ...getColorStyles()
      }}></div>
      {text && (
        <p style={{
          marginTop: '0.5rem',
          fontSize: '0.875rem',
          color: '#6B7280',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          margin: 0
        }}>
          {text}
        </p>
      )}
    </div>
  )
} 