import { Request, Response } from 'express'
import { db } from '../database'

export const listarParceiros = async (req: Request, res: Response) => {
  const [rows] = await db.query('SELECT * FROM parceiros ORDER BY nome')
  res.json(rows)
}

export const atualizarParceiro = async (req: Request, res: Response) => {
  const { id } = req.params
  const { nome } = req.body
  await db.query('UPDATE parceiros SET nome = ? WHERE id = ?', [nome, id])
  res.json({ mensagem: 'Parceiro atualizado' })
}

export const excluirParceiro = async (req: Request, res: Response) => {
  const { id } = req.params
  await db.query('DELETE FROM parceiros WHERE id = ?', [id])
  res.json({ mensagem: 'Parceiro excluído' })
}
