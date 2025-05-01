import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button, Alert, Card } from 'react-bootstrap'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const navigate = useNavigate()
  const { setToken, setUsuario } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    try {
      const res = await axios.post('http://localhost:3001/usuarios/login', { email, senha })
      setToken(res.data.token)
      setUsuario(res.data.usuario)

      alert('✅ Login realizado com sucesso!')
      navigate('/')
    } catch (err: any) {
      setErro(err.response?.data?.erro || 'Erro ao fazer login')
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card style={{ width: '100%', maxWidth: 400 }} className="p-4 shadow">
        <h3 className="text-center mb-4">🔐 Acesso ao FreelaOS</h3>
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>E-mail</Form.Label>
            <Form.Control
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="senha">
            <Form.Label>Senha</Form.Label>
            <div className="d-flex">
              <Form.Control
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <Button
                variant="outline-secondary"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                type="button"
                style={{ marginLeft: '8px' }}
              >
                {mostrarSenha ? '🙈' : '👁️'}
              </Button>
            </div>
          </Form.Group>

          {erro && <Alert variant="danger">{erro}</Alert>}

          <Button type="submit" variant="primary" className="w-100">
            Entrar
          </Button>
        </Form>
      </Card>
    </div>
  )
}

export default Login
