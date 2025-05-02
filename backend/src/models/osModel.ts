import { db } from '../database'
import { verificarOuCriarParceiro } from './parceiroModel'
import { verificarOuCriarCliente } from './clienteModel'
import { verificarOuCriarProjeto } from './projetoModel'

export interface Sessao {
  data: string
  inicio: string
  fim: string
}

export interface OrdemServico {
  numero: string
  cliente: string
  parceiro: string
  projeto: string
  tarefa: string
  observacoes: string
  sessoes: Sessao[]
  aguardandoCliente: boolean
  aguardandoParceiro: boolean
  finalizado: boolean
  trabalhando: boolean
  naFila?: boolean
  urgente?: boolean
  programadaPara?: string
}

const parseDate = (data: any) => {
  const d = new Date(data)
  return isNaN(d.getTime()) ? null : d
}

export const getAllOS = async () => {
  const [rows] = await db.query('SELECT * FROM ordens_servico')
  return rows
}

export const getOSByNumero = async (numero: string) => {
  const [rows]: any = await db.query('SELECT * FROM ordens_servico WHERE numero = ?', [numero])
  return rows[0]
}

export const createOS = async (os: Omit<OrdemServico, 'numero'>) => {
  const {
    cliente,
    parceiro,
    projeto,
    tarefa,
    observacoes,
    sessoes,
    aguardandoCliente,
    aguardandoParceiro,
    finalizado,
    trabalhando,
    naFila,
    urgente,
    programadaPara
  } = os

  const [rows]: any = await db.query("SELECT numero FROM ordens_servico ORDER BY id DESC LIMIT 1")
  let proximoNumero = 1

  if (rows.length > 0) {
    const ultimoNumero = rows[0].numero
    const match = ultimoNumero?.match(/OS-(\d+)/)
    if (match) {
      proximoNumero = parseInt(match[1], 10) + 1
    }
  }

  const numero = `OS-${proximoNumero.toString().padStart(6, '0')}`
  const sessoesJson = JSON.stringify(sessoes ?? [])

  const parceiroId = await verificarOuCriarParceiro(parceiro)
  const clienteId = await verificarOuCriarCliente(cliente, parceiroId)
  const projetoId = await verificarOuCriarProjeto(projeto, clienteId, parceiroId)

  await db.query(
    `INSERT INTO ordens_servico 
     (numero, cliente, parceiro, projeto, tarefa, observacoes, sessoes, 
      aguardandoCliente, aguardandoParceiro, finalizado, trabalhando, naFila, urgente,
      parceiro_id, cliente_id, projeto_id, programadaPara)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      numero,
      cliente,
      parceiro,
      projeto,
      tarefa,
      observacoes,
      sessoesJson,
      aguardandoCliente,
      aguardandoParceiro,
      finalizado,
      trabalhando,
      naFila ?? false,
      urgente ?? false,
      parceiroId,
      clienteId,
      projetoId,
      parseDate(programadaPara)
    ]
  )

  return {
    numero,
    cliente,
    parceiro,
    projeto,
    tarefa,
    observacoes,
    sessoes,
    aguardandoCliente,
    aguardandoParceiro,
    finalizado,
    trabalhando,
    naFila,
    urgente,
    programadaPara
  }
}

export const updateOS = async (numero: string, os: any) => {
  const {
    cliente,
    parceiro,
    projeto,
    tarefa,
    observacoes,
    sessoes,
    aguardandoCliente,
    aguardandoParceiro,
    finalizado,
    trabalhando,
    naFila,
    aberto_em,
    finalizado_em,
    urgente,
    programadaPara
  } = os

  const sessoesJson = JSON.stringify(sessoes ?? [])

  const [result] = await db.query(
    `UPDATE ordens_servico SET 
      cliente = ?, parceiro = ?, projeto = ?, tarefa = ?, observacoes = ?, sessoes = ?, 
      aguardandoCliente = ?, aguardandoParceiro = ?, finalizado = ?, trabalhando = ?, naFila = ?,
      aberto_em = ?, finalizado_em = ?, urgente = ?, programadaPara = ?
     WHERE numero = ?`,
    [
      cliente,
      parceiro,
      projeto,
      tarefa,
      observacoes,
      sessoesJson,
      aguardandoCliente,
      aguardandoParceiro,
      finalizado,
      trabalhando,
      naFila ?? false,
      parseDate(aberto_em),
      parseDate(finalizado_em),
      urgente ?? false,
      parseDate(programadaPara),
      numero
    ]
  )

  return result
}

export const deleteOS = async (numero: string) => {
  const [result] = await db.query('DELETE FROM ordens_servico WHERE numero = ?', [numero])
  return result
}
