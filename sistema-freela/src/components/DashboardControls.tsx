import React from 'react'
import { Button, Form, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

type StatusKey = 'todos' | 'finalizado' | 'trabalhando' | 'aguardandoCliente' | 'aguardandoParceiro' | 'naFila'

interface DashboardControlsProps {
  usuarioEmail?: string
  filtroStatus: StatusKey
  setFiltroStatus: (status: StatusKey) => void
  ordenarPor: string
  setOrdenarPor: (campo: string) => void
  busca: string
  setBusca: (texto: string) => void
}

const statusLabels: Record<Exclude<StatusKey, 'todos'>, string> = {
  finalizado: '✅ Finalizados',
  trabalhando: '🕐 Trabalhando',
  aguardandoCliente: '📩 Cliente',
  aguardandoParceiro: '👥 Parceiro',
  naFila: '📨 Na fila',
}

export const DashboardControls: React.FC<DashboardControlsProps> = ({
  usuarioEmail,
  filtroStatus,
  setFiltroStatus,
  ordenarPor,
  setOrdenarPor,
  busca,
  setBusca,
}) => {
  const navigate = useNavigate()

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="mb-0">📋 Painel de Ordens de Serviço</h2>
        <div className="d-flex flex-wrap gap-2">
          <Button variant="success" onClick={() => navigate('/nova-os')}>➕ Nova OS</Button>
          <Button variant="outline-primary" onClick={() => navigate('/calendario')}>📅 Calendário</Button>
          <Button variant="outline-secondary" onClick={() => navigate('/admin/entidades')}>🧩 Entidades</Button>
          {usuarioEmail === 'admin@admin.com' && (
            <Button variant="dark" onClick={() => navigate('/admin/usuarios')}>👤 Cadastrar Usuário</Button>
          )}
        </div>
      </div>

      <div className="mb-3">
        <strong>Filtrar por status:</strong>&nbsp;
        {Object.entries(statusLabels).map(([key, label]) => (
          <span
            key={key}
            style={{
              cursor: 'pointer',
              fontWeight: filtroStatus === key ? 'bold' : 'normal',
              marginRight: 10,
            }}
            onClick={() => setFiltroStatus(key as StatusKey)}
          >
            {label}
          </span>
        ))}
        <span
          style={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => setFiltroStatus('todos')}
        >
          🔄 Ver todos
        </span>
      </div>

      <Row className="mb-4 g-2">
        <Col md={4}>
          <Form.Select value={ordenarPor} onChange={e => setOrdenarPor(e.target.value)}>
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
            onChange={e => setBusca(e.target.value)}
          />
        </Col>
      </Row>
    </>
  )
}

export default DashboardControls
                                                                                                                                                                                                     