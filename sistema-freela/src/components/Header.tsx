import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'

const Header = () => {
  const navigate = useNavigate()
  const { token, usuario, setToken, setUsuario } = useAuth()
  const [modoEscuro, setModoEscuro] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('modoEscuro')
    if (saved === 'true') {
      setModoEscuro(true)
      document.body.classList.add('bg-dark', 'text-light')
    }
  }, [])

  const toggleModo = () => {
    const novo = !modoEscuro
    setModoEscuro(novo)
    localStorage.setItem('modoEscuro', String(novo))
    if (novo) {
      document.body.classList.add('bg-dark', 'text-light')
    } else {
      document.body.classList.remove('bg-dark', 'text-light')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setToken('')
    setUsuario(null)
    navigate('/login')
  }

  return (
    <Navbar expand="lg" className={`shadow-sm mb-4 ${modoEscuro ? 'bg-dark navbar-dark' : 'bg-light'}`}>
      <Container>
        <Navbar.Brand onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          FreelaOS
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse className="justify-content-end">
          <Nav className="align-items-center gap-3">
            {usuario && (
              <>
                <span className={modoEscuro ? 'text-light' : 'text-muted'}>
                  👋 Olá, {usuario.nome}
                </span>
                <Button
                  variant={modoEscuro ? 'outline-light' : 'outline-dark'}
                  size="sm"
                  onClick={toggleModo}
                >
                  {modoEscuro ? '☀️ Claro' : '🌙 Escuro'}
                </Button>
                <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                  🔒 Sair
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header
