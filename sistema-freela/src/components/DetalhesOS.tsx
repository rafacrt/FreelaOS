import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Card, ListGroup } from 'react-bootstrap'
import { useEffect, useRef } from 'react'
import html2pdf from 'html2pdf.js'
import api from '../services/api'

const DetalhesOS = () => {
  const pdfRef = useRef<HTMLDivElement>(null)
  const { state } = useLocation()
  const navigate = useNavigate()
  const os = state?.os

  useEffect(() => {
    if (!os) navigate('/')
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

  return (
    <div className="container py-4" ref={pdfRef}>
      <h2 className="mb-3">🔎 Detalhes da OS #{os.numero}</h2>

      <Card className="mb-4">
        <Card.Body>
          <h5>📁 Projeto: {os.projeto}</h5>
          <p>👤 Cliente: <strong>{os.cliente}</strong></p>
          <p>🤝 Parceiro: <strong>{os.parceiro}</strong></p>
          <p>🧩 Tarefa: {os.tarefa}</p>
          <p>📝 Observações: {os.observacoes || 'Nenhuma'}</p>
          <p>
            🏷️ Status: {os.finalizado ? '✅ Finalizado' : os.trabalhando ? '🕐 Trabalhando' : os.aguardandoParceiro ? '👥 Aguardando Parceiro' : os.aguardandoCliente ? '📩 Aguardando Cliente' : 'Sem status'}
          </p>
        </Card.Body>
      </Card>

      <h5>⏱️ Sessões de Tempo Trabalhado:</h5>
      <ListGroup className="mb-4">
        {os.sessoes.length === 0 && <ListGroup.Item>Nenhuma sessão registrada.</ListGroup.Item>}
        {os.sessoes.map((s: any, i: number) => (
          <ListGroup.Item key={i}>
            📅 {s.data} | 🕒 {s.inicio} até {s.fim}
          </ListGroup.Item>
        ))}
      </ListGroup>

      <div className="d-flex gap-2 flex-wrap">
        <Button variant="outline-primary" onClick={imprimirPagina}>🖨️ Imprimir</Button>
        <Button variant="outline-success" as="a" target="_blank" href={gerarLinkWhatsapp()}>🟢 WhatsApp</Button>
        <Button variant="outline-secondary" onClick={gerarPDF}>📥 Gerar PDF</Button>
        <Button variant="outline-warning" onClick={() => navigate(`/os/editar/${os.numero}`, { state: { os } })}>✏️ Editar OS</Button>
        <Button variant="outline-danger" onClick={excluirOS}>🗑️ Excluir OS</Button>
        <Button variant="light" onClick={() => navigate('/')}>⬅️ Voltar</Button>
      </div>
    </div>
  )
}

export default DetalhesOS
