import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button, Row, Col } from 'react-bootstrap'
import CreatableSelect from 'react-select/creatable'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import api from '../services/api'

interface SessaoTrabalho {
  data: string
  inicio: string
  fim: string
}

interface Option {
  value: string
  label: string
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
    naFila: true,            // status padrão 'Na fila'
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
        toast.error('Erro ao carregar opções de entidades')
      }
    }
    fetchEntidades()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSessaoChange = (index: number, field: keyof SessaoTrabalho, value: string) => {
    setSessoes(prev => {
      const copy = [...prev]
      copy[index][field] = value
      return copy
    })
  }

  const adicionarSessao = () => {
    setSessoes(prev => [...prev, { data: '', inicio: '', fim: '' }])
  }

  const removerSessao = (index: number) => {
    setSessoes(prev => prev.filter((_, i) => i !== index))
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
      sessoes,
    }

    try {
      await api.post('/os', novaOS)
      toast.success('✅ OS criada com sucesso!')
      navigate('/')
    } catch (err) {
      console.error('Erro ao criar OS:', err)
      toast.error('❌ Erro ao criar OS')
    }
  }

  const clienteOptions: Option[] = clientes.map(nome => ({ value: nome, label: nome }))
  const parceiroOptions: Option[] = parceiros.map(nome => ({ value: nome, label: nome }))
  const projetoOptions: Option[] = projetos.map(nome => ({ value: nome, label: nome }))

  return (
    <div className="container py-4">
      <ToastContainer position="top-center" />
      <h2 className="mb-4">🆕 Nova Ordem de Serviço</h2>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col>
            <Form.Label>Cliente</Form.Label>
            <CreatableSelect
              options={clienteOptions}
              onChange={opt => setFormData(prev => ({ ...prev, cliente: opt?.value || '' }))}
              onCreateOption={input => {
                setClientes(prev => [...prev, input])
                setFormData(prev => ({ ...prev, cliente: input }))
              }}
              value={clienteOptions.find(opt => opt.value === formData.cliente) || null}
              placeholder="Digite ou selecione..."
              isClearable
            />
          </Col>
          <Col>
            <Form.Label>Parceiro</Form.Label>
            <CreatableSelect
              options={parceiroOptions}
              onChange={opt => setFormData(prev => ({ ...prev, parceiro: opt?.value || '' }))}
              onCreateOption={input => {
                setParceiros(prev => [...prev, input])
                setFormData(prev => ({ ...prev, parceiro: input }))
              }}
              value={parceiroOptions.find(opt => opt.value === formData.parceiro) || null}
              placeholder="Digite ou selecione..."
              isClearable
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Label>Projeto</Form.Label>
            <CreatableSelect
              options={projetoOptions}
              onChange={opt => setFormData(prev => ({ ...prev, projeto: opt?.value || '' }))}
              onCreateOption={input => {
                setProjetos(prev => [...prev, input])
                setFormData(prev => ({ ...prev, projeto: input }))
              }}
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
            <Form.Check
              type="checkbox"
              label="Aguardando cliente"
              name="aguardandoCliente"
              checked={formData.aguardandoCliente}
              onChange={handleChange}
            />
          </Col>
          <Col xs={12} md={3}>
            <Form.Check
              type="checkbox"
              label="Aguardando parceiro"
              name="aguardandoParceiro"
              checked={formData.aguardandoParceiro}
              onChange={handleChange}
            />
          </Col>
          <Col xs={12} md={3}>
            <Form.Check
              type="checkbox"
              label="Finalizado"
              name="finalizado"
              checked={formData.finalizado}
              onChange={handleChange}
            />
          </Col>
          <Col xs={12} md={3}>
            <Form.Check
              type="checkbox"
              label="Trabalhando"
              name="trabalhando"
              checked={formData.trabalhando}
              onChange={handleChange}
            />
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
                  onChange={e => handleSessaoChange(index, 'data', e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="time"
                  value={sessao.inicio}
                  onChange={e => handleSessaoChange(index, 'inicio', e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="time"
                  value={sessao.fim}
                  onChange={e => handleSessaoChange(index, 'fim', e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Button variant="outline-danger" size="sm" onClick={() => removerSessao(index)}>
                  ❌
                </Button>
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
