import React from 'react'
import { Row, Col, Card, Badge, Form, Button } from 'react-bootstrap'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { OrdemDeServico } from '../types'

export interface DashboardCardsProps {
  ordens: OrdemDeServico[]
  ordensFiltradas: OrdemDeServico[]
  onDragEnd: (result: DropResult) => void
  abrirDetalhesOS: (os: OrdemDeServico) => void
  atualizarStatus: (os: OrdemDeServico, status: keyof OrdemDeServico) => void
  atualizarUrgencia: (numero: string) => void
  atualizandoUrgencia: string | null
  duplicarOS: (os: OrdemDeServico) => void
}

const getStatusBadge = (os: OrdemDeServico) => {
  if (os.finalizado) return <Badge bg="success">Finalizado</Badge>
  if (os.trabalhando) return <Badge bg="warning" text="dark">Trabalhando</Badge>
  if (os.aguardandoParceiro) return <Badge bg="primary">Aguardando Parceiro</Badge>
  if (os.aguardandoCliente) return <Badge bg="info">Aguardando Cliente</Badge>
  if (os.naFila) return <Badge bg="secondary">Na fila</Badge>
  return <Badge bg="light" text="dark">Sem status</Badge>
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  ordensFiltradas,
  onDragEnd,
  abrirDetalhesOS,
  atualizarStatus,
  atualizarUrgencia,
  atualizandoUrgencia,
  duplicarOS,
}) => (
  <DragDropContext onDragEnd={onDragEnd}>
    <Droppable droppableId="ordens">
      {(provided) => (
        <div {...provided.droppableProps} ref={provided.innerRef}>
          <Row xs={1} md={2} lg={3} className="g-4">
            {ordensFiltradas.map((os, index) => (
              <Draggable key={os.numero} draggableId={os.numero} index={index}>
                {(draggableProvided) => (
                  <Col
                    ref={draggableProvided.innerRef}
                    {...draggableProvided.draggableProps}
                    {...draggableProvided.dragHandleProps}
                  >
                    <Card
                      className={`shadow-sm h-100 position-relative ${os.urgente ? 'card-urgente' : ''}`}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: os.urgente
                          ? '#ff4d4d'
                          : os.finalizado
                            ? '#d4edda'
                            : os.trabalhando
                              ? '#fff3cd'
                              : os.aguardandoParceiro
                                ? '#d0dfff'
                                : os.aguardandoCliente
                                  ? '#cce5ff'
                                  : os.naFila
                                    ? '#e2e3e5'
                                    : '#f8f9fa',
                        color: os.urgente ? '#fff' : undefined,
                      }}
                      onClick={(e) => {
                        const tag = (e.target as HTMLElement).tagName.toLowerCase()
                        if (!['button', 'select', 'option'].includes(tag)) {
                          abrirDetalhesOS(os)
                        }
                      }}
                    >
                      {os.urgente && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '12px',
                          backgroundColor: '#b30000',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.8em',
                          fontWeight: 'bold',
                        }}>
                          🔥 URGENTE
                        </div>
                      )}
                      <Card.Body>
                        <Card.Title>#{os.numero} • {os.projeto}</Card.Title>
                        <Card.Subtitle className="mb-2" style={{
                          color: os.urgente ? '#fff' : 'var(--bs-secondary-color)',
                        }}>
                          {os.cliente} - {os.tarefa}
                        </Card.Subtitle>

                        <Card.Text style={{ color: os.urgente ? '#fff' : undefined }}>
                          <strong>Parceiro:</strong> {os.parceiro} <br />
                        </Card.Text>

                        {os.aberto_em && (
                          <div style={{
                            fontSize: '0.9em',
                            color: os.urgente ? '#fff' : 'var(--bs-secondary-color)',
                          }} className="mb-1">
                            📅 Aberto em: {new Date(os.aberto_em).toLocaleString('pt-BR')}
                          </div>
                        )}

                        {os.programadaPara && (
                          <div style={{
                            fontSize: '0.9em',
                            color: os.urgente ? '#fff' : 'var(--bs-secondary-color)',
                          }} className="mb-2">
                            📌 Programada para: {new Date(os.programadaPara).toLocaleString('pt-BR')}
                          </div>
                        )}

                        {getStatusBadge(os)}

                        <Form.Select
                          size="sm"
                          className="mt-2"
                          value={
                            os.finalizado
                              ? 'finalizado'
                              : os.trabalhando
                                ? 'trabalhando'
                                : os.aguardandoParceiro
                                  ? 'aguardandoParceiro'
                                  : os.aguardandoCliente
                                    ? 'aguardandoCliente'
                                    : os.naFila
                                      ? 'naFila'
                                      : ''
                          }
                          onClick={e => e.stopPropagation()}
                          onChange={e => atualizarStatus(os, e.target.value as keyof OrdemDeServico)}
                        >
                          <option value="">🔁 Mudar status...</option>
                          <option value="finalizado">✅ Finalizado</option>
                          <option value="trabalhando">🕐 Trabalhando</option>
                          <option value="aguardandoCliente">📩 Cliente</option>
                          <option value="aguardandoParceiro">👥 Parceiro</option>
                          <option value="naFila">📨 Na fila</option>
                        </Form.Select>

                        <Button
                          size="sm"
                          variant={os.urgente ? 'light' : 'outline-danger'}
                          disabled={atualizandoUrgencia === os.numero}
                          className="mt-3"
                          onClick={e => {
                            e.stopPropagation()
                            atualizarUrgencia(os.numero)
                          }}
                        >
                          {atualizandoUrgencia === os.numero
                            ? '⏳ Atualizando...'
                            : os.urgente
                              ? '❌ Remover urgência'
                              : '🚨 Marcar como Urgente'}
                        </Button>
                        <Button
                          size="sm"
                          className="mt-3 ms-2"
                          variant="secondary"
                          onClick={e => {
                            e.stopPropagation()
                            duplicarOS(os)
                          }}
                        >
                          📄 Duplicar
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                )}
              </Draggable>
            ))}
          </Row>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </DragDropContext>
)

export default DashboardCards
