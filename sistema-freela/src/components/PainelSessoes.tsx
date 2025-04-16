import { useEffect, useState } from 'react'
import { Card, Spinner } from 'react-bootstrap'
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
  sessoes: SessaoTrabalho[]
}

interface SessaoComOS extends SessaoTrabalho {
  os: OrdemDeServico
}

const PainelSessoes = () => {
  const [sessoes, setSessoes] = useState<SessaoComOS[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregarSessoes()
  }, [])

  const carregarSessoes = async () => {
    try {
      const res = await api.get('/os')
      const todasOS: OrdemDeServico[] = res.data.map((os: any) => ({
        ...os,
        sessoes: (() => {
          try {
            return JSON.parse(os.sessoes || '[]')
          } catch {
            return []
          }
        })()
      }))

      const listaSessoes: SessaoComOS[] = []
      todasOS.forEach(os => {
        os.sessoes.forEach(sessao => {
          listaSessoes.push({ ...sessao, os })
        })
      })

      setSessoes(listaSessoes)
      setCarregando(false)
    } catch (error) {
      console.error('Erro ao carregar sessões', error)
    }
  }

  const sessoesAgrupadas = sessoes.reduce((acc: Record<string, SessaoComOS[]>, sessao) => {
    const data = sessao.data
    if (!acc[data]) acc[data] = []
    acc[data].push(sessao)
    return acc
  }, {})

  const datasOrdenadas = Object.keys(sessoesAgrupadas).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  )

  return (
    <div className="container py-4">
      <h2 className="mb-4">🕓 Sessões de Trabalho por Data</h2>

      {carregando && <Spinner animation="border" />}

      {!carregando && datasOrdenadas.length === 0 && (
        <p className="text-muted">Nenhuma sessão registrada ainda.</p>
      )}

      {datasOrdenadas.map(data => (
        <div key={data} className="mb-4">
          <h5 className="mb-3">📅 {new Date(data).toLocaleDateString()}</h5>

          {sessoesAgrupadas[data].map((s, i) => (
            <Card key={i} className="mb-2 shadow-sm">
              <Card.Body>
                <strong>OS:</strong> #{s.os.numero} &nbsp;|&nbsp;
                <strong>Projeto:</strong> {s.os.projeto} <br />
                <strong>Cliente:</strong> {s.os.cliente} &nbsp;|&nbsp;
                <strong>Parceiro:</strong> {s.os.parceiro} <br />
                <strong>Horário:</strong> {s.inicio} → {s.fim}
              </Card.Body>
            </Card>
          ))}
        </div>
      ))}
    </div>
  )
}

export default PainelSessoes
