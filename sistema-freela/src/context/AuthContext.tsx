import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface Usuario {
  id: number
  nome: string
  email: string
  criado_em?: string
}

interface AuthContextType {
  token: string | null
  usuario: Usuario | null
  setToken: (token: string | null) => void
  setUsuario: (usuario: Usuario | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [usuario, setUsuario] = useState<Usuario | null>(
    localStorage.getItem('usuario') ? JSON.parse(localStorage.getItem('usuario')!) : null
  )

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    if (usuario) localStorage.setItem('usuario', JSON.stringify(usuario))
    else localStorage.removeItem('usuario')
  }, [usuario])

  const logout = () => {
    setToken(null)
    setUsuario(null)
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  return (
    <AuthContext.Provider value={{ token, usuario, setToken, setUsuario, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve estar dentro de AuthProvider')
  return context
}
