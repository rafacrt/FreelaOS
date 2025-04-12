import { useLocation, useNavigate } from 'react-router-dom'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { useState, useEffect } from 'react'
import api from '../services/api'

const EditarOS = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const os = state?.os

  const [formData, setFormData] = useState({
    numero: '',
    cliente: '',
    parceiro: '',
    projeto: '',
    tarefa: '',
    observacoes: '',
    aguardandoCliente: false,
    aguardandoParceiro: false,
    finalizado: false,
    trabalhando: false,
  })

  const [sessoes, setSessoes] = useState([{ data: '', inicio: '', fim: '' }])

  useEffect(() => {
    if (!os) {
      navigate('/')
      return
    }

    setFormData({ ...os })
    setSessoes(os.sessoes || [])
  }, [os, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSessaoChange = (index: number, field: string, value: string) => {
    const novas = [...sessoes]
    novas[index][field as keyof typeof novas[0]] = value
    setSessoes(novas)
  }

  const adicionarSessao = () => {
    setSessoes([...sessoes, { data: '', inicio: '', fim: '' }])
  }

  const removerSessao = (index: number) => {
    const novas = sessoes.filter((_, i) => i !== index)
    setSessoes(novas)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.put(`/os/${formData.numero}`, {
        ...formData,
        sessoes
      })
      alert('✅ OS atualizada com sucesso!')
      navigate('/')
    } catch (err) {
      alert('❌ Erro ao atualizar OS')
      console.error(err)
    }
  }

  return (
    <div className="container py-4">
      <h2 className="mb-3">✏️ Editar OS #{formData.numero}</h2>

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col>
            <Form.Label>Cliente</Form.Label>
            <Form.Control type="text" name="cliente" value={formData.cliente} onChange={handleChange} required />
          </Col>
          <Col>
            <Form.Label>Parceiro</Form.Label>
            <Form.Control type="text" name="parceiro" value={formData.parceiro} onChange={handleChange} required />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Label>Projeto</Form.Label>
            <Form.Control type="text" name="projeto" value={formData.projeto} onChange={handleChange} required />
          </Col>
          <Col>
            <Form.Label>Tarefa</Form.Label>
            <Form.Control type="text" name="tarefa" value={formData.tarefa} onChange={handleChange} required />
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Observações</Form.Label>
          <Form.Control as="textarea" rows={3} name="observacoes" value={formData.observacoes} onChange={handleChange} />
        </Form.Group>

        <Row className="mb-4">
          <Col md={3}>
            <Form.Check type="checkbox" label="Aguardando cliente" name="aguardandoCliente" checked={formData.aguardandoCliente} onChange={handleChange} />
          </Col>
          <Col md={3}>
            <Form.Check type="checkbox" label="Aguardando parceiro" name="aguardandoParceiro" checked={formData.aguardandoParceiro} onChange={handleChange} />
          </Col>
          <Col md={3}>
            <Form.Check type="checkbox" label="Finalizado" name="finalizado" checked={formData.finalizado} onChange={handleChange} />
          </Col>
          <Col md={3}>
            <Form.Check type="checkbox" label="Trabalhando" name="trabalhando" checked={formData.trabalhando} onChange={handleChange} />
          </Col>
        </Row>

        <h5 className="mb-3">⏱️ Sessões</h5>
        {sessoes.map((s, i) => (
          <Row key={i} className="mb-2 align-items-center">
            <Col md={3}>
              <Form.Control type="date" value={s.data} onChange={(e) => handleSessaoChange(i, 'data', e.target.value)} required />
            </Col>
            <Col md={3}>
              <Form.Control type="time" value={s.inicio} onChange={(e) => handleSessaoChange(i, 'inicio', e.target.value)} required />
            </Col>
            <Col md={3}>
              <Form.Control type="time" value={s.fim} onChange={(e) => handleSessaoChange(i, 'fim', e.target.value)} required />
            </Col>
            <Col md={3}>
              <Button variant="outline-danger" size="sm" onClick={() => removerSessao(i)}>❌</Button>
            </Col>
          </Row>
        ))}
        <Button variant="outline-primary" size="sm" className="mb-3" onClick={adicionarSessao}>➕ Adicionar Sessão</Button>

        <div className="d-flex gap-2 mt-3">
          <Button type="submit" variant="success">💾 Salvar Alterações</Button>
          <Button variant="secondary" onClick={() => navigate('/')}>⬅️ Cancelar</Button>
        </div>
      </Form>
    </div>
  )
}

export default EditarOS
