import { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { DropResult } from 'react-beautiful-dnd'
import 'react-toastify/dist/ReactToastify.css'

import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import DashboardControls from './DashboardControls'
import DashboardCards from './DashboardCards'
import { OrdemDeServico } from '../types'

const Dashboard = () => {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<
    'todos' | 'finalizado' | 'trabalhando' | 'aguardandoCliente' | 'aguardandoParceiro' | 'naFila'
  >('todos')
  const [ordenarPor, setOrdenarPor] = useState('recente')
  const [ordens, setOrdens] = useState<OrdemDeServico[]>([])
  const [atualizandoUrgencia, setAtualizandoUrgencia] = useState<string | null>(null)
  const alertaAudio = new Audio('/som-urgente.mp3')

  useEffect(() => {
    buscarOS()
  }, [filtroStatus])

  const buscarOS = async () => {
    try {
      const res = await api.get('/os')
      const dados: OrdemDeServico[] = res.data.map((os: any) => ({
        ...os,
        urgente: Boolean(os.urgente),
        finalizado: Boolean(os.finalizado),
        trabalhando: Boolean(os.trabalhando),
        aguardandoCliente: Boolean(os.aguardandoCliente),
        aguardandoParceiro: Boolean(os.aguardandoParceiro),
        naFila: Boolean(os.naFila),
        sessoes: (() => {
          try {
            return JSON.parse(os.sessoes || '[]')
          } catch {
            return []
          }
        })(),
      }))
      setOrdens(dados)
    } catch (err) {
      console.error('Erro ao buscar ordens de serviço:', err)
      alert('Erro ao carregar ordens de serviço')
    }
  }

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result
    if (!destination || filtroStatus !== 'naFila') return

    const fila = ordens.filter(o => o.naFila)
    const others = ordens.filter(o => !o.naFila)

    const novaFila = Array.from(fila)
    const [moved] = novaFila.splice(source.index, 1)
    novaFila.splice(destination.index, 0, moved)

    setOrdens([...novaFila, ...others])
  }

  const atualizarStatus = async (os: OrdemDeServico, novoStatus: keyof OrdemDeServico) => {
    const atualizado = {
      ...os,
      aguardandoCliente: false,
      aguardandoParceiro: false,
      finalizado: false,
      trabalhando: false,
      naFila: false,
      [novoStatus]: true,
    }
    if (novoStatus === 'finalizado') {
      if (!window.confirm('Deseja mudar para finalizado?')) return
      ;(atualizado as any).finalizado_em = new Date()
    }
    try {
      await api.put(`/os/${os.numero}`, atualizado)
      setOrdens(ordens.map(o => (o.numero === os.numero ? atualizado : o)))
      toast.success('✅ Status atualizado com sucesso!')
    } catch (err) {
      console.error(err)
      toast.error('❌ Erro ao atualizar status')
    }
  }

  const atualizarUrgencia = async (numero: string) => {
    const osNoState = ordens.find(o => o.numero === numero)
    if (!osNoState) return
    const novoValor = !osNoState.urgente
    setAtualizandoUrgencia(numero)
    setOrdens(prev => prev.map(o => (o.numero === numero ? { ...o, urgente: novoValor } : o)))
    if (novoValor) alertaAudio.play().catch(() => {})
    try {
      await api.put(`/os/${numero}`, { ...osNoState, urgente: novoValor })
      toast.success(`🚨 Urgência ${novoValor ? 'ativada' : 'removida'} com sucesso!`)
    } catch (err) {
      console.error(err)
      toast.error('❌ Erro ao atualizar urgência')
      setOrdens(prev => prev.map(o => (o.numero === numero ? { ...o, urgente: osNoState.urgente } : o)))
    } finally {
      setAtualizandoUrgencia(null)
    }
  }

  const abrirDetalhesOS = (os: OrdemDeServico) => {
    navigate(`/os/${os.numero}`, { state: { os } })
  }

  const duplicarOS = async (os: OrdemDeServico) => {
    if (!window.confirm('Deseja duplicar esta OS?')) return
    try {
      const res = await api.post(`/os/duplicar/${os.numero}`)
      const novo: any = res.data
      const novaOS: OrdemDeServico = {
        ...novo,
        urgente: Boolean(novo.urgente),
        finalizado: Boolean(novo.finalizado),
        trabalhando: Boolean(novo.trabalhando),
        aguardandoCliente: Boolean(novo.aguardandoCliente),
        aguardandoParceiro: Boolean(novo.aguardandoParceiro),
        naFila: Boolean(novo.naFila),
        sessoes: JSON.parse(novo.sessoes || '[]'),
      }
      setOrdens(prev => [...prev, novaOS])
      toast.success('✅ OS duplicada com sucesso!')
      navigate(`/os/${novaOS.numero}`, { state: { os: novaOS } })
    } catch {
      toast.error('❌ Erro ao duplicar')
    }
  }

  const ordensFiltradas = ordens
    .filter(os => {
      if (filtroStatus === 'todos') return !os.finalizado
      return (os as any)[filtroStatus]
    })
    .filter(os =>
      os.numero.toLowerCase().includes(busca.toLowerCase()) ||
      os.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      os.projeto.toLowerCase().includes(busca.toLowerCase()) ||
      os.tarefa.toLowerCase().includes(busca.toLowerCase())
    )
    .sort((a, b) => {
      // Urgentes sempre no topo
      if (a.urgente && !b.urgente) return -1
      if (!a.urgente && b.urgente) return 1

      // Senão, por ordem de abertura (mais antigo primeiro)
      const aData = a.aberto_em ? new Date(a.aberto_em).getTime() : 0
      const bData = b.aberto_em ? new Date(b.aberto_em).getTime() : 0
      return aData - bData
    })

  return (
    <div>
      <DashboardControls
        usuarioEmail={usuario?.email}
        filtroStatus={filtroStatus}
        setFiltroStatus={setFiltroStatus}
        ordenarPor={ordenarPor}
        setOrdenarPor={setOrdenarPor}
        busca={busca}
        setBusca={setBusca}
      />

      <DashboardCards
        ordens={ordens}
        ordensFiltradas={ordensFiltradas}
        onDragEnd={onDragEnd}
        abrirDetalhesOS={abrirDetalhesOS}
        atualizarStatus={atualizarStatus}
        atualizarUrgencia={atualizarUrgencia}
        atualizandoUrgencia={atualizandoUrgencia}
        duplicarOS={duplicarOS}
      />

      <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar />
    </div>
  )
}

export default Dashboard
