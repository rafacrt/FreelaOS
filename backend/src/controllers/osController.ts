// src/controllers/osController.ts
import { Request, Response } from 'express'
import {
  createOS,
  getAllOS,
  getOSByNumero,
  updateOS,
  deleteOS
} from '../models/osModel'
import { db } from '../database'
import { RowDataPacket } from 'mysql2'

export const listarOS = async (req: Request, res: Response) => {
  try {
    const ordens = await getAllOS()
    res.json(ordens)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar OSs' })
  }
}

export const buscarOS = async (req: Request, res: Response) => {
  try {
    const os = await getOSByNumero(req.params.numero)
    if (!os) return res.status(404).json({ erro: 'OS não encontrada' })
    res.json(os)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar OS' })
  }
}

export const criarOS = async (req: Request, res: Response) => {
  try {
    const novaOS = await createOS(req.body)
    res.status(201).json(novaOS)
  } catch (error) {
    console.error('❌ Erro ao criar OS:', error)
    res.status(500).json({
      erro: 'Erro ao criar OS',
      detalhe: error instanceof Error ? error.message : String(error)
    })
  }
}

export const atualizarOS = async (req: Request, res: Response) => {
  try {
    await updateOS(req.params.numero, req.body)
    res.status(200).json({ mensagem: 'OS atualizada com sucesso' })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar OS' })
  }
}

export const excluirOS = async (req: Request, res: Response) => {
  try {
    await deleteOS(req.params.numero)
    res.status(200).json({ mensagem: 'OS excluída com sucesso' })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir OS' })
  }
}

export const duplicateOS = async (req: Request, res: Response) => {
  const { numero } = req.params
  try {
    // 1) busca a OS original
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT * FROM ordens_servico WHERE numero = ?',
      [numero]
    )
    const original = rows[0]
    if (!original) {
      return res.status(404).json({ error: 'OS não encontrada' })
    }

    // 2) gera o próximo número sequencial
    const [maxRows]: any = await db.query("SELECT numero FROM ordens_servico ORDER BY id DESC LIMIT 1")
    let proximoNumero = 1

    if (maxRows.length > 0) {
      const ultimoNumero = maxRows[0].numero
      const match = ultimoNumero?.match(/OS-(\d+)/)
      if (match) {
        proximoNumero = parseInt(match[1], 10) + 1
      }
    }

    const novoNumero = `OS-${proximoNumero.toString().padStart(6, '0')}`

    // 3) prepara os dados
    const clone: any = { ...original }
    delete clone.id
    clone.numero = novoNumero
    clone.created_at = new Date()

    // 4) insere a nova OS
    await db.query('INSERT INTO ordens_servico SET ?', [clone])

    // 5) busca e retorna a OS recém-criada
    const [newRows] = await db.query<RowDataPacket[]>(
      'SELECT * FROM ordens_servico WHERE numero = ?',
      [novoNumero]
    )
    const novaOS = newRows[0]
    return res.status(201).json(novaOS)
  } catch (err) {
    console.error('Erro ao duplicar OS:', err)
    return res.status(500).json({ error: 'Erro ao duplicar OS' })
  }
}

