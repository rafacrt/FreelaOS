import { useEffect, useState } from 'react'
import { Card, Row, Col, Badge, Form, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

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
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [ordenarPor, setOrdenarPor] = useState('recente')
  const [ordens, setOrdens] = useState<OrdemDeServico[]>([])
  const alertaAudio = new Audio('/som-urgente.mp3')

  useEffect(() => {
    buscarOS()
  }, [])

  const buscarOS = async () => {
    const res = await api.get('/os')
    let dados = res.data.map((os: any) => ({
      ...os,
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
      if (!confirmar) return
      (atualizado as any).finalizado_em = new Date()
    }

    try {
      await api.put(`/os/${os.numero}`, atualizado)
      setOrdens(ordens.map(o => o.numero === os.numero ? atualizado : o))
    } catch (err) {
      alert('❌ Erro ao atualizar status')
      console.error(err)
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
      const isFinalizado = Boolean(os.finalizado)
      const isTrabalhando = Boolean(os.trabalhando)
      const isAguardandoCliente = Boolean(os.aguardandoCliente)
      const isAguardandoParceiro = Boolean(os.aguardandoParceiro)

      if (filtroStatus === 'finalizado') return isFinalizado
      if (filtroStatus === 'trabalhando') return isTrabalhando
      if (filtroStatus === 'aguardandoCliente') return isAguardandoCliente
      if (filtroStatus === 'aguardandoParceiro') return isAguardandoParceiro
      if (filtroStatus === 'todos') return true

      return !isFinalizado
    })
    .filter(os =>
      os.numero.toLowerCase().includes(busca.toLowerCase()) ||
      os.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      os.projeto.toLowerCase().includes(busca.toLowerCase()) ||
      os.tarefa.toLowerCase().includes(busca.toLowerCase())
    )

  ordensFiltradas.sort((a, b) => {
    if (a.urgente && !b.urgente) return -1
    if (!a.urgente && b.urgente) return 1

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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">📋 Painel de Ordens de Serviço</h2>
        <Button variant="outline-primary" onClick={() => navigate('/calendario')}>
          📅 Ver Calendário
        </Button>
      </div>

      <div className="mb-3">
        <strong>Resumo (clique para filtrar):</strong> &nbsp;

        <span style={{ cursor: 'pointer', fontWeight: filtroStatus === 'finalizado' ? 'bold' : 'normal' }} onClick={() => { setFiltroStatus('finalizado'); buscarOS() }}>
          ✅ Finalizados: {totais.finalizados}
        </span> &nbsp;|&nbsp;

        <span style={{ cursor: 'pointer', fontWeight: filtroStatus === 'trabalhando' ? 'bold' : 'normal' }} onClick={() => { setFiltroStatus('trabalhando'); buscarOS() }}>
          🕐 Trabalhando: {totais.trabalhando}
        </span> &nbsp;|&nbsp;

        <span style={{ cursor: 'pointer', fontWeight: filtroStatus === 'aguardandoCliente' ? 'bold' : 'normal' }} onClick={() => { setFiltroStatus('aguardandoCliente'); buscarOS() }}>
          📩 Aguardando Cliente: {totais.aguardandoCliente}
        </span> &nbsp;|&nbsp;

        <span style={{ cursor: 'pointer', fontWeight: filtroStatus === 'aguardandoParceiro' ? 'bold' : 'normal' }} onClick={() => { setFiltroStatus('aguardandoParceiro'); buscarOS() }}>
          👥 Aguardando Parceiro: {totais.aguardandoParceiro}
        </span> &nbsp;

        <span style={{ cursor: 'pointer', textDecoration: 'underline', marginLeft: 10 }} onClick={() => { setFiltroStatus('todos'); buscarOS() }}>
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
          <Col key={index}>
            <Card
              border="light"
              className="shadow-sm h-100 position-relative"
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
                <Card.Subtitle className="mb-2 text-muted" style={{ color: os.urgente ? '#fff' : undefined }}>
                  {os.cliente} - {os.tarefa}
                </Card.Subtitle>
                <Card.Text style={{ color: os.urgente ? '#fff' : undefined }}>
                  <strong>Parceiro:</strong> {os.parceiro} <br />
                  <strong>Obs:</strong> {os.observacoes || 'Nenhuma'}
                </Card.Text>

                {os.aberto_em && (
                  <div className="text-muted mb-2" style={{ fontSize: '0.9em', color: os.urgente ? '#fff' : undefined }}>
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
                  <option value="aguardandoCliente">📩 Aguardando Cliente</option>
                  <option value="aguardandoParceiro">👥 Aguardando Parceiro</option>
                </Form.Select>

                <Button
                  size="sm"
                  variant={os.urgente ? 'light' : 'outline-danger'}
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    const novoValor = os.urgente ? 0 : 1
                    api.put(`/os/${os.numero}`, {
                      ...os,
                      urgente: novoValor
                    }).then(() => {
                      setOrdens(ordens.map(o =>
                        o.numero === os.numero ? { ...o, urgente: !!novoValor } : o
                      ))
                      if (novoValor === 1) {
                        alertaAudio.play().catch(() => {})
                      }                      
                    }).catch(() => {
                      alert('❌ Erro ao atualizar urgência')
                    })
                  }}
                >
                  {os.urgente ? '❌ Urgente' : '🚨 Marcar como Urgente'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default Dashboard
