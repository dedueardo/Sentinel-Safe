import React, { createContext, useContext, useState, useEffect, useCallback, } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'


interface User {
  id: number
  name: string
  email: string
  created_at: string
}

interface AuthContextData {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextData | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Este useEffect carrega a sessão do usuário ao iniciar a aplicação
  useEffect(() => {
    const storedUser = localStorage.getItem('@Sentinel:user')
    const storedToken = localStorage.getItem('@Sentinel:token')

    if (storedUser && storedToken) {
      //  Configurar o token no Axios para que as chamadas à API funcionem após recarregar a página
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
      setUser(JSON.parse(storedUser))
    }

    setLoading(false)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await api.post('/auth/login', { email, password })
        const { token, user } = response.data

        // Salvar no localStorage
        localStorage.setItem('@Sentinel:user', JSON.stringify(user))
        localStorage.setItem('@Sentinel:token', token)

        // Configurar o token no Axios para as próximas requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`

        setUser(user)
        navigate('/dashboard') // Redirecionar para a página principal após o login
      } catch (error) {
        console.error('Falha no login:', error)
        throw new Error('Credenciais inválidas')
      }
    },
    [navigate]
  )

  //  Implementar a função de logout completa
  const logout = useCallback(() => {
    localStorage.removeItem('@Sentinel:user')
    localStorage.removeItem('@Sentinel:token')

    // Limpar o estado
    setUser(null)

    // Remover o header de autorização do Axios
    delete api.defaults.headers.common['Authorization']

    navigate('/login')
  }, [navigate])

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
      {/* Evita renderizar o app antes de verificar a autenticação */}
      {!loading && children}
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