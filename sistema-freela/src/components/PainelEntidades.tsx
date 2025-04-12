import { useEffect, useState } from 'react'
import { Card, Button, Collapse, Spinner, Form } from 'react-bootstrap'
import api from '../services/api'

interface Projeto {
  id: number
  nome: string
  editando?: boolean
  novoNome?: string
}

interface Cliente {
  id: number
  nome: string
  projetos?: Projeto[]
  mostrarProjetos?: boolean
  editando?: boolean
  novoNome?: string
}

interface Parceiro {
  id: number
  nome: string
  clientes?: Cliente[]
  mostrarClientes?: boolean
  editando?: boolean
  novoNome?: string
}

const PainelEntidades = () => {
  const [parceiros, setParceiros] = useState<Parceiro[]>([])
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    carregarParceiros()
  }, [])

  const carregarParceiros = async () => {
    const res = await api.get('/entidades/parceiros')
    setParceiros(res.data)
  }

  const toggleClientes = async (parceiro: Parceiro) => {
    if (!parceiro.clientes) {
      setCarregando(true)
      const res = await api.get(`/entidades/parceiros/${parceiro.id}/clientes`)
      parceiro.clientes = res.data
    }
    parceiro.mostrarClientes = !parceiro.mostrarClientes
    setParceiros([...parceiros])
    setCarregando(false)
  }

  const toggleProjetos = async (cliente: Cliente, parceiro: Parceiro) => {
    if (!cliente.projetos) {
      setCarregando(true)
      const res = await api.get(`/entidades/clientes/${cliente.id}/projetos`)
      cliente.projetos = res.data
    }
    cliente.mostrarProjetos = !cliente.mostrarProjetos
    setParceiros([...parceiros])
    setCarregando(false)
  }

  const atualizarNome = async (tipo: 'parceiro' | 'cliente' | 'projeto', entidade: any, novoNome: string) => {
    await api.put(`/entidades/${tipo}s/${entidade.id}`, { nome: novoNome })
    entidade.nome = novoNome
    entidade.editando = false
    setParceiros([...parceiros])
  }

  const excluir = async (tipo: 'parceiro' | 'cliente' | 'projeto', entidade: any, pai?: any) => {
    if (confirm(`Tem certeza que deseja excluir este ${tipo}?`)) {
      await api.delete(`/entidades/${tipo}s/${entidade.id}`)
      if (tipo === 'parceiro') {
        setParceiros(parceiros.filter(p => p.id !== entidade.id))
      } else if (tipo === 'cliente' && pai) {
        pai.clientes = pai.clientes.filter((c: Cliente) => c.id !== entidade.id)
      } else if (tipo === 'projeto' && pai) {
        pai.projetos = pai.projetos.filter((p: Projeto) => p.id !== entidade.id)
      }
      setParceiros([...parceiros])
    }
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">📂 Entidades (Parceiros, Clientes e Projetos)</h2>

      {carregando && <Spinner animation="border" className="mb-3" />}

      {parceiros.map((p, i) => (
        <Card key={i} className="mb-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div>
              <Button variant="link" onClick={() => toggleClientes(p)}>
                {p.mostrarClientes ? '▼' : '▶'}{' '}
              </Button>
              {p.editando ? (
                <>
                  <Form.Control
                    size="sm"
                    value={p.novoNome || p.nome}
                    onChange={e => {
                      p.novoNome = e.target.value
                      setParceiros([...parceiros])
                    }}
                    style={{ display: 'inline-block', width: '200px' }}
                  />
                  <Button
                    variant="success"
                    size="sm"
                    className="ms-2"
                    onClick={() => atualizarNome('parceiro', p, p.novoNome || p.nome)}
                  >💾</Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="ms-1"
                    onClick={() => {
                      p.editando = false
                      setParceiros([...parceiros])
                    }}
                  >✖</Button>
                </>
              ) : (
                <>
                  <strong>{p.nome}</strong>
                  <Button variant="outline-dark" size="sm" className="ms-2" onClick={() => {
                    p.editando = true
                    p.novoNome = p.nome
                    setParceiros([...parceiros])
                  }}>✏️</Button>
                  <Button variant="outline-danger" size="sm" className="ms-1" onClick={() => excluir('parceiro', p)}>❌</Button>
                </>
              )}
            </div>
          </Card.Header>

          <Collapse in={p.mostrarClientes}>
            <div>
              <Card.Body>
                {p.clientes?.map((c, j) => (
                  <div key={j} className="mb-2 ms-3">
                    {c.editando ? (
                      <>
                        <Form.Control
                          size="sm"
                          value={c.novoNome || c.nome}
                          onChange={e => {
                            c.novoNome = e.target.value
                            setParceiros([...parceiros])
                          }}
                          style={{ display: 'inline-block', width: '200px' }}
                        />
                        <Button
                          variant="success"
                          size="sm"
                          className="ms-2"
                          onClick={() => atualizarNome('cliente', c, c.novoNome || c.nome)}
                        >💾</Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="ms-1"
                          onClick={() => {
                            c.editando = false
                            setParceiros([...parceiros])
                          }}
                        >✖</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline-secondary" size="sm" onClick={() => toggleProjetos(c, p)}>
                          {c.mostrarProjetos ? '▼' : '▶'} {c.nome}
                        </Button>
                        <Button variant="outline-dark" size="sm" className="ms-2" onClick={() => {
                          c.editando = true
                          c.novoNome = c.nome
                          setParceiros([...parceiros])
                        }}>✏️</Button>
                        <Button variant="outline-danger" size="sm" className="ms-1" onClick={() => excluir('cliente', c, p)}>❌</Button>
                      </>
                    )}

                    <Collapse in={c.mostrarProjetos}>
                      <div className="ms-4 mt-1">
                        {c.projetos?.map((proj, k) => (
                          <div key={k}>
                            {proj.editando ? (
                              <>
                                <Form.Control
                                  size="sm"
                                  value={proj.novoNome || proj.nome}
                                  onChange={e => {
                                    proj.novoNome = e.target.value
                                    setParceiros([...parceiros])
                                  }}
                                  style={{ display: 'inline-block', width: '200px' }}
                                />
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="ms-2"
                                  onClick={() => atualizarNome('projeto', proj, proj.novoNome || proj.nome)}
                                >💾</Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="ms-1"
                                  onClick={() => {
                                    proj.editando = false
                                    setParceiros([...parceiros])
                                  }}
                                >✖</Button>
                              </>
                            ) : (
                              <>
                                📁 {proj.nome}
                                <Button
                                  variant="outline-dark"
                                  size="sm"
                                  className="ms-2"
                                  onClick={() => {
                                    proj.editando = true
                                    proj.novoNome = proj.nome
                                    setParceiros([...parceiros])
                                  }}
                                >✏️</Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="ms-1"
                                  onClick={() => excluir('projeto', proj, c)}>❌</Button>
                              </>
                            )}
                          </div>
                        )) || <div className="text-muted">Nenhum projeto</div>}
                      </div>
                    </Collapse>
                  </div>
                )) || <div className="text-muted">Nenhum cliente</div>}
              </Card.Body>
            </div>
          </Collapse>
        </Card>
      ))}
    </div>
  )
}

export default PainelEntidades
