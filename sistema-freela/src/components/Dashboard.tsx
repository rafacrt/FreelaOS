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
  const [ordenarPor, setOrdenarPor] = useState('recente')
  const [ordens, setOrdens] = useState<OrdemDeServico[]>([])

  useEffect(() => {
    buscarOS()
  }, [])

  const buscarOS = async () => {
    const res = await api.get('/os')
    const dados = res.data.map((os: any) => ({
      ...os,
      sessoes: (() => {
        try {
          return JSON.parse(os.sessoes || '[]')
        } catch {
          return []
        }
      })(),
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

  // Ordenação
  ordensFiltradas.sort((a, b) => {
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
      <h2 className="mb-3">📋 Painel de Ordens de Serviço</h2>

      <div className="mb-3">
        <strong>Resumo (clique para filtrar):</strong> &nbsp;

        <span
          style={{ cursor: 'pointer', fontWeight: filtroStatus === 'finalizado' ? 'bold' : 'normal' }}
          onClick={() => setFiltroStatus('finalizado')}
        >
          ✅ Finalizados: {totais.finalizados}
        </span> &nbsp;|&nbsp;

        <span
          style={{ cursor: 'pointer', fontWeight: filtroStatus === 'trabalhando' ? 'bold' : 'normal' }}
          onClick={() => setFiltroStatus('trabalhando')}
        >
          🕐 Trabalhando: {totais.trabalhando}
        </span> &nbsp;|&nbsp;

        <span
          style={{ cursor: 'pointer', fontWeight: filtroStatus === 'aguardandoCliente' ? 'bold' : 'normal' }}
          onClick={() => setFiltroStatus('aguardandoCliente')}
        >
          📩 Aguardando Cliente: {totais.aguardandoCliente}
        </span> &nbsp;|&nbsp;

        <span
          style={{ cursor: 'pointer', fontWeight: filtroStatus === 'aguardandoParceiro' ? 'bold' : 'normal' }}
          onClick={() => setFiltroStatus('aguardandoParceiro')}
        >
          👥 Aguardando Parceiro: {totais.aguardandoParceiro}
        </span> &nbsp;

        <span
          style={{ cursor: 'pointer', textDecoration: 'underline', marginLeft: 10 }}
          onClick={() => setFiltroStatus('todos')}
        >
          🔄 Ver todos
        </span>
      </div>

      <Row className="mb-4 g-2">
        <Col md={4}>
          <Form.Select
            value={ordenarPor}
            onChange={(e) => setOrdenarPor(e.target.value)}
          >
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
