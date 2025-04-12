import { useEffect, useState } from 'react'
import { Card, Row, Col, Badge, Form } from 'react-bootstrap'
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
}

const Dashboard = () => {
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroParceiro, setFiltroParceiro] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [ordens, setOrdens] = useState<OrdemDeServico[]>([])

  useEffect(() => {
    buscarOS()
  }, [])

  const buscarOS = async () => {
    const res = await api.get('/os')
    const dados = res.data.map((os: any) => ({
      ...os,
      sessoes: JSON.parse(os.sessoes || '[]'),
    }))
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

  const parceirosUnicos = [...new Set(ordens.map(o => o.parceiro))].sort()
  const clientesUnicos = [...new Set(ordens.map(o => o.cliente))].sort()

  const ordensFiltradas = ordens
    .filter((os) => {
      if (filtroStatus === 'finalizado') return os.finalizado
      if (filtroStatus === 'trabalhando') return os.trabalhando
      if (filtroStatus === 'aguardandoCliente') return os.aguardandoCliente
      if (filtroStatus === 'aguardandoParceiro') return os.aguardandoParceiro
      return true // 'todos'
    })
    .filter((os) => {
      if (filtroParceiro && os.parceiro !== filtroParceiro) return false
      if (filtroCliente && os.cliente !== filtroCliente) return false
      return true
    })
    .filter(os =>
      os.numero.toLowerCase().includes(busca.toLowerCase()) ||
      os.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      os.projeto.toLowerCase().includes(busca.toLowerCase()) ||
      os.tarefa.toLowerCase().includes(busca.toLowerCase())
    )

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
      <h2 className="mb-3">📋 Painel de Ordens de Serviço</h2>

      <div className="mb-3">
        <strong>Resumo:</strong> &nbsp;
        ✅ Finalizados: {totais.finalizados} &nbsp;|&nbsp;
        🕐 Trabalhando: {totais.trabalhando} &nbsp;|&nbsp;
        📩 Aguardando Cliente: {totais.aguardandoCliente} &nbsp;|&nbsp;
        👥 Aguardando Parceiro: {totais.aguardandoParceiro}
      </div>

      <Row className="mb-4 g-2">
        <Col md={3}>
          <Form.Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value="todos">🔁 Todos os status</option>
            <option value="finalizado">✅ Finalizado</option>
            <option value="trabalhando">🕐 Trabalhando</option>
            <option value="aguardandoCliente">📩 Aguardando Cliente</option>
            <option value="aguardandoParceiro">👥 Aguardando Parceiro</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={filtroParceiro} onChange={(e) => setFiltroParceiro(e.target.value)}>
            <option value="">👤 Todos os parceiros</option>
            {parceirosUnicos.map((p, i) => (
              <option key={i} value={p}>{p}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)}>
            <option value="">🏢 Todos os clientes</option>
            {clientesUnicos.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="🔍 Buscar OS, projeto ou tarefa..."
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
              className="shadow-sm h-100"
              style={{
                cursor: 'pointer',
                backgroundColor:
                  os.finalizado ? '#d4edda' :
                  os.trabalhando ? '#fff3cd' :
                  os.aguardandoParceiro ? '#d0dfff' :
                  os.aguardandoCliente ? '#cce5ff' :
                  '#f8f9fa',
              }}
              onClick={() => abrirDetalhesOS(os)}
            >
              <Card.Body>
                <Card.Title>#{os.numero} • {os.projeto}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{os.cliente} - {os.tarefa}</Card.Subtitle>
                <Card.Text>
                  <strong>Parceiro:</strong> {os.parceiro} <br />
                  <strong>Obs:</strong> {os.observacoes || 'Nenhuma'}
                </Card.Text>

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
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default Dashboard
