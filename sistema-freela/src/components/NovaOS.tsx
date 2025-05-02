import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button, Row, Col } from 'react-bootstrap'
import Select from 'react-select'
import api from '../services/api'

interface SessaoTrabalho {
  data: string
  inicio: string
  fim: string
}

const NovaOS = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
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

  const [sessoes, setSessoes] = useState<SessaoTrabalho[]>([])
  const [clientes, setClientes] = useState<string[]>([])
  const [parceiros, setParceiros] = useState<string[]>([])
  const [projetos, setProjetos] = useState<string[]>([])

  useEffect(() => {
    const fetchEntidades = async () => {
      try {
        const [resClientes, resParceiros, resProjetos] = await Promise.all([
          api.get('/entidades/clientes'),
          api.get('/entidades/parceiros/todos'),
          api.get('/entidades/projetos/todos')
        ])
        setClientes(resClientes.data.map((c: any) => c.nome))
        setParceiros(resParceiros.data.map((p: any) => p.nome))
        setProjetos(resProjetos.data.map((p: any) => p.nome))
      } catch (err) {
        console.error('Erro ao buscar entidades:', err)
      }
    }
    fetchEntidades()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSessaoChange = (index: number, field: keyof SessaoTrabalho, value: string) => {
    const novas = [...sessoes]
    novas[index][field] = value
    setSessoes(novas)
  }

  const adicionarSessao = () => {
    setSessoes([...sessoes, { data: '', inicio: '', fim: '' }])
  }

  const removerSessao = (index: number) => {
    const novas = sessoes.filter((_, i) => i !== index)
    setSessoes(novas)
  }

  const gerarNumeroOS = () => {
    const numero = Math.floor(1000000 + Math.random() * 9000000)
    return `OS-${numero}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const novaOS = {
      numero: gerarNumeroOS(),
      ...formData,
      sessoes: Array.isArray(sessoes) ? sessoes : []
    }

    try {
      await api.post('/os', novaOS)
      alert('✅ OS criada com sucesso!')
      navigate('/')
    } catch (err) {
      alert('❌ Erro ao criar OS')
      console.error(err)
    }
  }

  const clienteOptions = clientes.map(nome => ({ value: nome, label: nome }))
  const parceiroOptions = parceiros.map(nome => ({ value: nome, label: nome }))
  const projetoOptions = projetos.map(nome => ({ value: nome, label: nome }))

  return (
    <div className="container py-4">
      <h2 className="mb-4">🆕 Nova Ordem de Serviço</h2>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col>
            <Form.Label>Cliente</Form.Label>
            <Select
              options={clienteOptions}
              onChange={(opcao) => setFormData({ ...formData, cliente: opcao?.value || '' })}
              value={clienteOptions.find(opt => opt.value === formData.cliente) || null}
              placeholder="Digite ou selecione..."
              isClearable
            />
          </Col>
          <Col>
            <Form.Label>Parceiro</Form.Label>
            <Select
              options={parceiroOptions}
              onChange={(opcao) => setFormData({ ...formData, parceiro: opcao?.value || '' })}
              value={parceiroOptions.find(opt => opt.value === formData.parceiro) || null}
              placeholder="Digite ou selecione..."
              isClearable
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Label>Projeto</Form.Label>
            <Select
              options={projetoOptions}
              onChange={(opcao) => setFormData({ ...formData, projeto: opcao?.value || '' })}
              value={projetoOptions.find(opt => opt.value === formData.projeto) || null}
              placeholder="Digite ou selecione..."
              isClearable
            />
          </Col>
          <Col>
            <Form.Label>Tarefa</Form.Label>
            <Form.Control
              type="text"
              name="tarefa"
              value={formData.tarefa}
              onChange={handleChange}
              required
            />
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Observações</Form.Label>
          <Form.Control
            as="textarea"
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            rows={3}
          />
        </Form.Group>

        <Row className="mb-4">
          <Col xs={12} md={3}>
            <Form.Check type="checkbox" label="Aguardando cliente" name="aguardandoCliente" checked={formData.aguardandoCliente} onChange={handleChange} />
          </Col>
          <Col xs={12} md={3}>
            <Form.Check type="checkbox" label="Aguardando parceiro" name="aguardandoParceiro" checked={formData.aguardandoParceiro} onChange={handleChange} />
          </Col>
          <Col xs={12} md={3}>
            <Form.Check type="checkbox" label="Finalizado" name="finalizado" checked={formData.finalizado} onChange={handleChange} />
          </Col>
          <Col xs={12} md={3}>
            <Form.Check type="checkbox" label="Trabalhando" name="trabalhando" checked={formData.trabalhando} onChange={handleChange} />
          </Col>
        </Row>

        <div className="mb-4">
          <h5 className="mb-3">⏱️ Tempo Trabalhado (opcional)</h5>
          {sessoes.map((sessao, index) => (
            <Row key={index} className="mb-2 align-items-center">
              <Col md={3}>
                <Form.Control
                  type="date"
                  value={sessao.data}
                  onChange={(e) => handleSessaoChange(index, 'data', e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="time"
                  value={sessao.inicio}
                  onChange={(e) => handleSessaoChange(index, 'inicio', e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="time"
                  value={sessao.fim}
                  onChange={(e) => handleSessaoChange(index, 'fim', e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Button variant="outline-danger" size="sm" onClick={() => removerSessao(index)}>❌</Button>
              </Col>
            </Row>
          ))}

          <Button variant="outline-primary" size="sm" onClick={adicionarSessao}>
            ➕ Adicionar Sessão
          </Button>
        </div>

        <Button type="submit" variant="primary">
          Salvar OS
        </Button>
      </Form>
    </div>
  )
}

export default NovaOS
