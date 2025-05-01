import { useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' // ✅ importar o hook

const CadastroUsuario = () => {
  const { token } = useAuth() // ✅ pega o token do contexto
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const navigate = useNavigate()

  // ⛔ bloqueia se não estiver logado
  if (!token) return <div className="container mt-5 text-danger"><h4>Acesso não autorizado</h4></div>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setSucesso('')

    try {
      await api.post('/usuarios/cadastrar', { nome, email, senha })
      setSucesso('✅ Usuário cadastrado com sucesso!')
      setNome('')
      setEmail('')
      setSenha('')
    } catch (err: any) {
      setErro(err.response?.data?.erro || 'Erro ao cadastrar')
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 500 }}>
      <h2 className="mb-4">👤 Cadastro de Usuário</h2>
      <form onSubmit={handleSubmit}>
        {/* ...restante do form */}
      </form>
    </div>
  )
}

export default CadastroUsuario
