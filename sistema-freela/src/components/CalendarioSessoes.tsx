import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import api from '../services/api'
import { Spinner } from 'react-bootstrap'

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

const CalendarioSessoes = () => {
  const [eventos, setEventos] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregarEventos()
  }, [])

  const carregarEventos = async () => {
    try {
      const res = await api.get('/os')
      const dados: OrdemDeServico[] = res.data.map((os: any) => ({
        ...os,
        sessoes: (() => {
          try {
            return JSON.parse(os.sessoes || '[]')
          } catch {
            return []
          }
        })()
      }))

      const eventosMapeados: any[] = []

      dados.forEach(os => {
        os.sessoes.forEach(sessao => {
          const dataInicio = `${sessao.data}T${sessao.inicio}`
          const dataFim = `${sessao.data}T${sessao.fim}`
          eventosMapeados.push({
            title: `#${os.numero} • ${os.projeto}`,
            start: dataInicio,
            end: dataFim,
            extendedProps: {
              cliente: os.cliente,
              parceiro: os.parceiro,
              tarefa: os.tarefa,
            }
          })
        })
      })

      setEventos(eventosMapeados)
    } catch (err) {
      console.error('Erro ao carregar sessões:', err)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">📆 Calendário de Sessões</h2>

      {carregando && <Spinner animation="border" />}

      {!carregando && (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          events={eventos}
          locale="pt-br"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          eventClick={(info) => {
            const { title, start, end, extendedProps } = info.event
            alert(
              `${title}\n` +
              `📅 ${start?.toLocaleString()} → ${end?.toLocaleString()}\n` +
              `👤 Cliente: ${extendedProps.cliente}\n` +
              `🤝 Parceiro: ${extendedProps.parceiro}\n` +
              `📌 Tarefa: ${extendedProps.tarefa}`
            )
          }}
          height="auto"
        />
      )}
    </div>
  )
}

export default CalendarioSessoes
