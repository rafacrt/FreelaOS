import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useEffect, useState } from 'react'
import api from '../services/api'

const locales = { 'pt-BR': ptBR }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
})

const Calendario = () => {
  const [eventos, setEventos] = useState<any[]>([])

  useEffect(() => {
    api.get('/os').then(res => {
      const eventosFormatados = res.data.map((os: any) => {
        const isProgramada = !!os.programadaPara
        const start = new Date(os.programadaPara || os.aberto_em || os.created_at || new Date())
        const end = new Date(os.finalizado_em || os.programadaPara || os.aberto_em || os.created_at || new Date())

        const statusCor = isProgramada
          ? '#6f42c1' // Roxo para programado
          : os.urgente ? '#ff4d4d'
          : os.finalizado ? '#28a745'
          : os.trabalhando ? '#ffc107'
          : os.aguardandoParceiro ? '#007bff'
          : os.aguardandoCliente ? '#17a2b8'
          : '#6c757d'

        return {
          title: `${os.numero} - ${os.projeto}`,
          start,
          end,
          allDay: true,
          resource: os,
          color: statusCor
        }
      })

      setEventos(eventosFormatados)
    })
  }, [])

  return (
    <div className="p-4">
      <h2 className="mb-3">📆 Visualização por Calendário</h2>
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.color,
            color: 'white',
            borderRadius: '5px',
            padding: '4px'
          }
        })}
      />
    </div>
  )
}

export default Calendario
