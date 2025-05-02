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
  programadaPara?: string
}

export const getAllOS = async () => {
  const [rows] = await db.query('SELECT * FROM ordens_servico')
  return rows
}

export const getOSByNumero = async (numero: string) => {
  const [rows]: any = await db.query('SELECT * FROM ordens_servico WHERE numero = ?', [numero])
  return rows[0]
}

export const createOS = async (os: OrdemServico) => {
  const {
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
    programadaPara
  } = os

  const sessoesJson = JSON.stringify(sessoes ?? [])

  const parceiroId = await verificarOuCriarParceiro(parceiro)
  const clienteId = await verificarOuCriarCliente(cliente, parceiroId)
  const projetoId = await verificarOuCriarProjeto(projeto, clienteId, parceiroId)

  await db.query(
    `INSERT INTO ordens_servico 
     (numero, cliente, parceiro, projeto, tarefa, observacoes, sessoes, 
      aguardandoCliente, aguardandoParceiro, finalizado, trabalhando, 
      parceiro_id, cliente_id, projeto_id, programadaPara)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      parceiroId,
      clienteId,
      projetoId,
      programadaPara || null
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
    aberto_em,
    finalizado_em,
    urgente,
    programadaPara
  } = os

  const sessoesJson = JSON.stringify(sessoes ?? [])

  const [result] = await db.query(
    `UPDATE ordens_servico SET 
      cliente = ?, parceiro = ?, projeto = ?, tarefa = ?, observacoes = ?, sessoes = ?, 
      aguardandoCliente = ?, aguardandoParceiro = ?, finalizado = ?, trabalhando = ?,
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
      aberto_em || null,
      finalizado_em || null,
      urgente || 0,
      programadaPara || null,
      numero
    ]
  )

  return result
}

export const deleteOS = async (numero: string) => {
  const [result] = await db.query('DELETE FROM ordens_servico WHERE numero = ?', [numero])
  return result
}