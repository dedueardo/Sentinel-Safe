import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface User {
  id: string
  login: string
  name: string
  email: string
  avatar_url?: string
}

interface AuthContextData {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextData | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Verificar se existe um usuário no localStorage
    const storedUser = localStorage.getItem('@Sentinel:user')
    const storedToken = localStorage.getItem('@Sentinel:token')

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Aqui você faria a chamada real para sua API
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Dados mockados para teste
      const mockUser: User = {
        id: '1',
        login: 'Gaius Van Baelsar',
        name: 'Gaius Van Baelsar',
        email: email,
        avatar_url: 'https://github.com/github.png'
      }

      // Salvar no localStorage
      localStorage.setItem('@Sentinel:user', JSON.stringify(mockUser))
      localStorage.setItem('@Sentinel:token', 'mock-jwt-token')

      setUser(mockUser)
      navigate('/')
    } catch (error) {
      throw new Error('Credenciais inválidas')
    }
  }

  const logout = async () => {
    // Remover dados do localStorage
    localStorage.removeItem('@Sentinel:user')
    localStorage.removeItem('@Sentinel:token')

    setUser(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}