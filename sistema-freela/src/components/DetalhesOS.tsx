import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Card, ListGroup, Form, Row, Col, Badge } from 'react-bootstrap'
import { useEffect, useRef, useState } from 'react'
import html2pdf from 'html2pdf.js'
import api from '../services/api'

const DetalhesOS = () => {
  const pdfRef = useRef<HTMLDivElement>(null)
  const { state } = useLocation()
  const navigate = useNavigate()
  const os = state?.os

  const [abertoEm, setAbertoEm] = useState('')
  const [finalizadoEm, setFinalizadoEm] = useState('')
  const [programadaPara, setProgramadaPara] = useState('')
  const [urgente, setUrgente] = useState(false)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!os) return navigate('/')

    if (os.aberto_em) {
      setAbertoEm(os.aberto_em.slice(0, 16))
    } else {
      const agora = new Date().toISOString().slice(0, 16)
      setAbertoEm(agora)
      api.put(`/os/${os.numero}`, { ...os, aberto_em: new Date() })
    }

    if (os.finalizado_em) {
      setFinalizadoEm(os.finalizado_em.slice(0, 16))
    }

    if (os.programadaPara) {
      setProgramadaPara(os.programadaPara.slice(0, 16))
    }

    if (os.urgente !== undefined) {
      setUrgente(!!os.urgente)
    }
  }, [os, navigate])

  if (!os) return null

  const gerarLinkWhatsapp = () => {
    const msg = `Ordem de Serviço ${os.numero}%0AProjeto: ${os.projeto}%0ACliente: ${os.cliente}%0ATarefa: ${os.tarefa}`
    return `https://wa.me/?text=${msg}`
  }

  const imprimirPagina = () => window.print()

  const gerarPDF = () => {
    if (pdfRef.current) {
      html2pdf().from(pdfRef.current).set({
        margin: 10,
        filename: `${os.numero}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).save()
    }
  }

  const excluirOS = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir a OS ${os.numero}?`)) return

    try {
      await api.delete(`/os/${os.numero}`)
      alert('🗑️ OS excluída com sucesso!')
      navigate('/')
    } catch (err) {
      alert('❌ Erro ao excluir OS')
      console.error(err)
    }
  }

  const salvarDatas = async () => {
    setSalvando(true)
    try {
      await api.put(`/os/${os.numero}`, {
        cliente: os.cliente,
        parceiro: os.parceiro,
        projeto: os.projeto,
        tarefa: os.tarefa,
        observacoes: os.observacoes,
        sessoes: os.sessoes,
        aguardandoCliente: os.aguardandoCliente,
        aguardandoParceiro: os.aguardandoParceiro,
        finalizado: os.finalizado,
        trabalhando: os.trabalhando,
        naFila: os.naFila,
        urgente,
        programadaPara: programadaPara ? new Date(programadaPara) : null,
        aberto_em: abertoEm ? new Date(abertoEm) : null,
        finalizado_em: finalizadoEm ? new Date(finalizadoEm) : null
      })
      alert('💾 Alterações salvas com sucesso!')
    } catch (err) {
      alert('❌ Erro ao salvar alterações')
      console.error(err)
    } finally {
      setSalvando(false)
    }
  }

  return (

    <div className="container py-4" ref={pdfRef}>
      <h2 className="mb-4">
        {urgente && <span className="me-2">🔥</span>} Detalhes da OS <strong>#{os.numero}</strong>
      </h2>
      


      <Card className={`mb-4 shadow-sm border-0 ${urgente ? 'urgente' : ''}`}>
        <Card.Body>
          <Row>
            {/* Coluna esquerda */}
            <Col md={6}>
              <p><strong>📁 Projeto:</strong> {os.projeto}</p>
              <p><strong>👤 Cliente:</strong> {os.cliente}</p>
              <p><strong>🤝 Parceiro:</strong> {os.parceiro}</p>
              <p><strong>🧩 Tarefa:</strong> {os.tarefa}</p>
              <p><strong>📝 Observações:</strong> {os.observacoes || 'Nenhuma'}</p>
              <p><strong>🏷️ Status:</strong> &nbsp;
                {os.finalizado ? <Badge bg="success">Finalizado</Badge> :
                  os.trabalhando ? <Badge bg="warning" text="dark">Trabalhando</Badge> :
                    os.aguardandoParceiro ? <Badge bg="primary">Aguardando Parceiro</Badge> :
                      os.aguardandoCliente ? <Badge bg="info">Aguardando Cliente</Badge> :
                        <Badge bg="secondary">Sem status</Badge>}
              </p>
            </Col>

            {/* Coluna direita */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>📅 Abertura</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={abertoEm}
                  onChange={(e) => setAbertoEm(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>✅ Finalização</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={finalizadoEm}
                  onChange={(e) => setFinalizadoEm(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>📌 Programada para</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={programadaPara}
                  onChange={(e) => setProgramadaPara(e.target.value)}
                />
              </Form.Group>

              <Button variant="primary" onClick={salvarDatas} disabled={salvando} className="w-100">
                {salvando ? 'Salvando...' : '💾 Salvar Alterações'}
              </Button>
              

            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Sessões */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <h5 className="mb-3">⏱️ Sessões de Tempo Trabalhado</h5>
          <ListGroup>
            {os.sessoes.length === 0 && (
              <ListGroup.Item>Nenhuma sessão registrada.</ListGroup.Item>
            )}
            {os.sessoes.map((s: any, i: number) => (
              <ListGroup.Item key={i}>
                📅 {s.data} | 🕒 {s.inicio} até {s.fim}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>

      {/* Ações */}
      <div className="d-flex flex-wrap gap-2">
        <Button variant="outline-primary" onClick={imprimirPagina}>🖨️ Imprimir</Button>
        <Button variant="outline-success" as="a" target="_blank" href={gerarLinkWhatsapp()}>🟢 WhatsApp</Button>
        <Button variant="outline-secondary" onClick={gerarPDF}>📥 Gerar PDF</Button>
        <Button variant="outline-warning" onClick={() => navigate(`/os/editar/${os.numero}`, { state: { os } })}>✏️ Editar OS</Button>
        <Button variant="outline-danger" onClick={excluirOS}>🗑️ Excluir OS</Button>
        
        <Button
          variant={urgente ? 'danger' : 'outline-danger'}
          onClick={async () => {
            try {
              await api.put(`/os/${os.numero}`, {
                ...os,
                urgente: urgente ? 0 : 1
              })
              setUrgente(!urgente)
            } catch (err) {
              alert('❌ Erro ao atualizar urgência')
              console.error(err)
            }
          }}
        >
          {urgente ? '❌ Remover Urgência' : '🚨 Marcar como Urgente'}
        </Button>
        <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
              e.stopPropagation()
              if (window.confirm('Deseja duplicar esta OS?')) {
              api.post(`/os/duplicar/${os.numero}`).then(() => {
              toast.success('✅ OS duplicada com sucesso!')
              buscarOS() // recarrega lista
              }).catch(() => toast.error('❌ Erro ao duplicar'))
            }
          }}
        >
  📄 Duplicar
</Button>
<Button variant="light" onClick={() => navigate('/')}>⬅️ Voltar</Button>
      </div>
    </div>
  )
}

export default DetalhesOS
