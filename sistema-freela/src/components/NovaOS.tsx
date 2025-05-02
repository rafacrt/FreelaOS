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
    naFila: true,   // status padrão
  })

  const [sessoes, setSessoes] = useState<SessaoTrabalho[]>([])
  const [clientes, setClientes] = useState<string[]>([])
  const [parceiros, setParceiros] = useState<string[]>([])
  const [projetos, setProjetos] = useState<string[]>([])

  useEffect(() => {
    async function fetchEntidades() {
      try {
        const [resC, resP, resPr] = await Promise.all([
          api.get('/entidades/clientes'),
          api.get('/entidades/parceiros/todos'),
          api.get('/entidades/projetos/todos'),
        ])
        setClientes(resC.data.map((c: any) => c.nome))
        setParceiros(resP.data.map((p: any) => p.nome))
        setProjetos(resPr.data.map((pr: any) => pr.nome))
      } catch {
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

  const handleSessaoChange = (i: number, field: keyof SessaoTrabalho, value: string) => {
    setSessoes(prev => {
      const copy = [...prev]
      copy[i][field] = value
      return copy
    })
  }

  const adicionarSessao = () => {
    setSessoes(prev => [...prev, { data: '', inicio: '', fim: '' }])
  }

  const removerSessao = (i: number) => {
    setSessoes(prev => prev.filter((_, idx) => idx !== i))
  }

  const gerarNumeroOS = () => `OS-${Math.floor(1000000 + Math.random() * 9000000)}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    const novaOS = {
      numero: gerarNumeroOS(),
      ...formData,
      aberto_em: now,
      sessoes,
    }
    try {
      await api.post('/os', novaOS)
      toast.success('✅ OS criada com sucesso!')
      navigate('/')
    } catch {
      toast.error('❌ Erro ao criar OS')
    }
  }

  const clienteOptions = clientes.map(n => ({ value: n, label: n }))
  const parceiroOptions = parceiros.map(n => ({ value: n, label: n }))
  const projetoOptions = projetos.map(n => ({ value: n, label: n }))

  return (
    <div className="container py-4">
      <ToastContainer position="top-center" />
      <h2 className="mb-4">🆕 Nova Ordem de Serviço</h2>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col xs={6} md={2}>
            <Form.Check
              type="checkbox" label="Na fila" name="naFila"
              checked={formData.naFila} onChange={handleChange}
            />
          </Col>
          <Col xs={6} md={2}>
            <Form.Check
              type="checkbox" label="Aguardando cliente" name="aguardandoCliente"
              checked={formData.aguardandoCliente} onChange={handleChange}
            />
          </Col>
          <Col xs={6} md={2}>
            <Form.Check
              type="checkbox" label="Aguardando parceiro" name="aguardandoParceiro"
              checked={formData.aguardandoParceiro} onChange={handleChange}
            />
          </Col>
          <Col xs={6} md={2}>
            <Form.Check
              type="checkbox" label="Finalizado" name="finalizado"
              checked={formData.finalizado} onChange={handleChange}
            />
          </Col>
          <Col xs={6} md={2}>
            <Form.Check
              type="checkbox" label="Trabalhando" name="trabalhando"
              checked={formData.trabalhando} onChange={handleChange}
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Cliente</Form.Label>
            <CreatableSelect
              options={clienteOptions}
              onChange={opt => setFormData(prev => ({ ...prev, cliente: opt?.value || '' }))}
              onCreateOption={input => {
                setClientes(prev => [...prev, input])
                setFormData(prev => ({ ...prev, cliente: input }))
              }}
              value={clienteOptions.find(o => o.value === formData.cliente) || null}
              placeholder="Digite ou selecione..." isClearable
            />
          </Col>
          <Col md={6}>
            <Form.Label>Parceiro</Form.Label>
            <CreatableSelect
              options={parceiroOptions}
              onChange={opt => setFormData(prev => ({ ...prev, parceiro: opt?.value || '' }))}
              onCreateOption={input => {
                setParceiros(prev => [...prev, input])
                setFormData(prev => ({ ...prev, parceiro: input }))
              }}
              value={parceiroOptions.find(o => o.value === formData.parceiro) || null}
              placeholder="Digite ou selecione..." isClearable
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Projeto</Form.Label>
            <CreatableSelect
              options={projetoOptions}
              onChange={opt => setFormData(prev => ({ ...prev, projeto: opt?.value || '' }))}
              onCreateOption={input => {
                setProjetos(prev => [...prev, input])
                setFormData(prev => ({ ...prev, projeto: input }))
              }}
              value={projetoOptions.find(o => o.value === formData.projeto) || null}
              placeholder="Digite ou selecione..." isClearable
            />
          </Col>
          <Col md={6}>
            <Form.Label>Tarefa</Form.Label>
            <Form.Control
              type="text" name="tarefa"
              value={formData.tarefa} onChange={handleChange}
              required
            />
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Observações</Form.Label>
          <Form.Control
            as="textarea" name="observacoes"
            value={formData.observacoes} onChange={handleChange}
            rows={3}
          />
        </Form.Group>

        <div className="mb-4">
          <h5 className="mb-3">⏱️ Tempo Trabalhado (opcional)</h5>
          {sessoes.map((sessao, i) => (
            <Row key={i} className="mb-2 align-items-center">
              <Col md={3}>
                <Form.Control
                  type="date" value={sessao.data}
                  onChange={e => handleSessaoChange(i, 'data', e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="time" value={sessao.inicio}
                  onChange={e => handleSessaoChange(i, 'inicio', e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="time" value={sessao.fim}
                  onChange={e => handleSessaoChange(i, 'fim', e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Button variant="outline-danger" size="sm" onClick={() => removerSessao(i)}>
                  ❌
                </Button>
              </Col>
            </Row>
          ))}
          <Button variant="outline-primary" size="sm" onClick={adicionarSessao}>
            ➕ Adicionar Sessão
          </Button>
        </div>

        <Button type="submit" variant="primary">Salvar OS</Button>
      </Form>
    </div>
  )
}

export default NovaOS
