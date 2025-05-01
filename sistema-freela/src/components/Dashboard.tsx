import { useEffect, useState } from 'react'
import { Card, Row, Col, Badge, Form, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface SessaoTrabalho {
  data: string
  inicio: string
  fim: string
}

interface OrdemDeServico {
  numero: string
  cliente: string
  parceiro: string
  projeto: string
  tarefa: string
  observacoes: string
  sessoes: SessaoTrabalho[]
  aguardandoCliente: boolean
  aguardandoParceiro: boolean
  finalizado: boolean
  trabalhando: boolean
  urgente: boolean
  aberto_em?: string
}

const Dashboard = () => {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [ordenarPor, setOrdenarPor] = useState('recente')
  const [ordens, setOrdens] = useState<OrdemDeServico[]>([])
  const [atualizandoUrgencia, setAtualizandoUrgencia] = useState<string | null>(null)
  const alertaAudio = new Audio('/som-urgente.mp3')

  useEffect(() => {
    buscarOS()
  }, [])

  const buscarOS = async () => {
    try {
      const res = await api.get('/os')
      let dados = res.data.map((os: any) => ({
        ...os,
        // Normalizar valores booleanos
        urgente: Boolean(os.urgente),
        finalizado: Boolean(os.finalizado),
        trabalhando: Boolean(os.trabalhando),
        aguardandoCliente: Boolean(os.aguardandoCliente),
        aguardandoParceiro: Boolean(os.aguardandoParceiro),
        sessoes: (() => {
          try {
            return JSON.parse(os.sessoes || '[]')
          } catch {
            return []
          }
        })(),
      }))

      if (filtroStatus === 'todos') {
        dados = dados.filter((os: OrdemDeServico) => !os.finalizado)
      }

      setOrdens(dados)
    } catch (err) {
      console.error('Erro ao buscar ordens de serviço:', err)
      alert('Erro ao carregar ordens de serviço')
    }
  }

  const atualizarStatus = async (os: OrdemDeServico, novoStatus: keyof OrdemDeServico) => {
    const atualizado = {
      ...os,
      aguardandoCliente: false,
      aguardandoParceiro: false,
      finalizado: false,
      trabalhando: false,
      [novoStatus]: true
    }

    if (novoStatus === 'finalizado') {
      const confirmar = window.confirm('Deseja mudar para finalizado?')
      if (!confirmar) {
        return
      }
      (atualizado as any).finalizado_em = new Date()
    }

    try {
      await api.put(`/os/${os.numero}`, atualizado)
      setOrdens(ordens.map(o => o.numero === os.numero ? atualizado : o))
      toast.success('✅ Status atualizado com sucesso!')
    } catch (err) {
      toast.error('❌ Erro ao atualizar status')
      console.error(err)
    }
    
  }

  const atualizarUrgencia = async (numero: string) => {
    const osNoState = ordens.find(o => o.numero === numero)
    if (!osNoState) return
  
    const novoValor = !osNoState.urgente
    setAtualizandoUrgencia(numero)
  
    setOrdens(prev =>
      prev.map(o =>
        o.numero === numero
          ? { ...o, urgente: novoValor }
          : o
      )
    )
  
    if (novoValor) alertaAudio.play().catch(() => { })
  
    try {
      await api.put(`/os/${numero}`, { ...osNoState, urgente: novoValor })
      toast.success(`🚨 Urgência ${novoValor ? 'ativada' : 'removida'} com sucesso!`)
    } catch (err) {
      console.error(err)
      toast.error('❌ Erro ao atualizar urgência')
      setOrdens(prev =>
        prev.map(o =>
          o.numero === numero
            ? { ...o, urgente: osNoState.urgente }
            : o
        )
      )
    } finally {
      setAtualizandoUrgencia(null)
    }
  }
  



  const totais = {
    finalizados: ordens.filter(os => os.finalizado).length,
    trabalhando: ordens.filter(os => os.trabalhando).length,
    aguardandoCliente: ordens.filter(os => os.aguardandoCliente).length,
    aguardandoParceiro: ordens.filter(os => os.aguardandoParceiro).length,
  }

  const ordensFiltradas = ordens
    .filter((os) => {
      if (filtroStatus === 'finalizado') return os.finalizado
      if (filtroStatus === 'trabalhando') return os.trabalhando
      if (filtroStatus === 'aguardandoCliente') return os.aguardandoCliente
      if (filtroStatus === 'aguardandoParceiro') return os.aguardandoParceiro
      return true
    })
    .filter(os =>
      os.numero.toLowerCase().includes(busca.toLowerCase()) ||
      os.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      os.projeto.toLowerCase().includes(busca.toLowerCase()) ||
      os.tarefa.toLowerCase().includes(busca.toLowerCase())
    )
    .sort((a, b) => {
      if (ordenarPor === 'recente') return b.numero.localeCompare(a.numero)
      if (ordenarPor === 'numero') return a.numero.localeCompare(b.numero)
      if (ordenarPor === 'cliente') return a.cliente.localeCompare(b.cliente)
      if (ordenarPor === 'projeto') return a.projeto.localeCompare(b.projeto)
      return 0
    })


  const getStatusBadge = (os: OrdemDeServico) => {
    if (os.finalizado) return <Badge bg="success">Finalizado</Badge>
    if (os.trabalhando) return <Badge bg="warning" text="dark">Trabalhando</Badge>
    if (os.aguardandoParceiro) return <Badge bg="primary">Aguardando Parceiro</Badge>
    if (os.aguardandoCliente) return <Badge bg="info">Aguardando Cliente</Badge>
    return <Badge bg="secondary">Sem status</Badge>
  }

  const abrirDetalhesOS = (os: OrdemDeServico) => {
    navigate(`/os/${os.numero}`, { state: { os } })
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="mb-0">📋 Painel de Ordens de Serviço</h2>
        <div className="d-flex flex-wrap gap-2">
          <Button variant="success" onClick={() => navigate('/nova-os')}>➕ Nova OS</Button>
          <Button variant="outline-primary" onClick={() => navigate('/calendario')}>📅 Calendário</Button>
          <Button variant="outline-secondary" onClick={() => navigate('/admin/entidades')}>🧩 Entidades</Button>
          {usuario?.email === 'admin@admin.com' && (
            <Button variant="dark" onClick={() => navigate('/admin/usuarios')}>👤 Cadastrar Usuário</Button>
          )}
        </div>
      </div>

      <div className="mb-3">
        <strong>Filtrar por status:</strong> &nbsp;
        {['finalizado', 'trabalhando', 'aguardandoCliente', 'aguardandoParceiro'].map((status) => (
          <span
            key={status}
            style={{ cursor: 'pointer', fontWeight: filtroStatus === status ? 'bold' : 'normal', marginRight: 10 }}
            onClick={() => { setFiltroStatus(status); buscarOS() }}
          >
            {status === 'finalizado' && '✅ Finalizados'}
            {status === 'trabalhando' && '🕐 Trabalhando'}
            {status === 'aguardandoCliente' && '📩 Cliente'}
            {status === 'aguardandoParceiro' && '👥 Parceiro'}
          </span>
        ))}
        <span
          style={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => { setFiltroStatus('todos'); buscarOS() }}
        >
          🔄 Ver todos
        </span>
      </div>

      <Row className="mb-4 g-2">
        <Col md={4}>
          <Form.Select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)}>
            <option value="recente">📅 Mais recente</option>
            <option value="numero">🔢 Número da OS</option>
            <option value="cliente">🏢 Nome do Cliente</option>
            <option value="projeto">📁 Nome do Projeto</option>
          </Form.Select>
        </Col>
        <Col md={8}>
          <Form.Control
            type="text"
            placeholder="🔍 Buscar OS, cliente, projeto ou tarefa..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </Col>
      </Row>

      <Row xs={1} md={2} lg={3} className="g-4">
        {ordensFiltradas.map((os, index) => (
          <Col key={os.numero}>
            <Card
              key={os.numero}
              className={`shadow-sm h-100 position-relative ${os.urgente ? 'card-urgente' : ''}`}
              style={{
                cursor: 'pointer',
    backgroundColor: os.urgente ? '#ff4d4d' :
      os.finalizado ? '#d4edda' :
      os.trabalhando ? '#fff3cd' :
      os.aguardandoParceiro ? '#d0dfff' :
      os.aguardandoCliente ? '#cce5ff' :
      '#f8f9fa',
    color: os.urgente ? '#fff' : undefined
              }}
              onClick={() => abrirDetalhesOS(os)}
            >

              {os.urgente && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '12px',
                  backgroundColor: '#b30000',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.8em',
                  fontWeight: 'bold'
                }}>
                  🔥 URGENTE
                </div>
              )}
              <Card.Body>
                <Card.Title>#{os.numero} • {os.projeto}</Card.Title>
                <Card.Subtitle className="mb-2" style={{
                  color: os.urgente ? '#fff' : 'var(--bs-secondary-color)'
                }}>
                  {os.cliente} - {os.tarefa}
                </Card.Subtitle>
                <Card.Text style={{ color: os.urgente ? '#fff' : undefined }}>
                  <strong>Parceiro:</strong> {os.parceiro} <br />
                  <strong>Obs:</strong> {os.observacoes || 'Nenhuma'}
                </Card.Text>
                {os.aberto_em && (
                  <div style={{
                    fontSize: '0.9em',
                    color: os.urgente ? '#fff' : 'var(--bs-secondary-color)'
                  }} className="mb-2">
                    📅 Aberto em: {new Date(os.aberto_em).toLocaleString('pt-BR')}
                  </div>
                )}
                {getStatusBadge(os)}

                <Form.Select
                  size="sm"
                  className="mt-2"
                  value={
                    os.finalizado ? 'finalizado' :
                      os.trabalhando ? 'trabalhando' :
                        os.aguardandoParceiro ? 'aguardandoParceiro' :
                          os.aguardandoCliente ? 'aguardandoCliente' : ''
                  }
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => atualizarStatus(os, e.target.value as keyof OrdemDeServico)}
                >
                  <option value="">🔁 Mudar status...</option>
                  <option value="finalizado">✅ Finalizado</option>
                  <option value="trabalhando">🕐 Trabalhando</option>
                  <option value="aguardandoCliente">📩 Cliente</option>
                  <option value="aguardandoParceiro">👥 Parceiro</option>
                </Form.Select>

                <Button
                  size="sm"
                  variant={os.urgente ? 'light' : 'outline-danger'}
                  disabled={atualizandoUrgencia === os.numero}
                  className="mt-3" // aqui aumentamos de mt-2 para mt-3
                  onClick={e => {
                    e.stopPropagation()
                    atualizarUrgencia(os.numero)
                  }}
                >
                  {atualizandoUrgencia === os.numero
                    ? '⏳ Atualizando...'
                    : os.urgente
                      ? '❌ Remover urgência'
                      : '🚨 Marcar como Urgente'
                  }
                </Button>

              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar />
    </div>
  )
}

export default Dashboard