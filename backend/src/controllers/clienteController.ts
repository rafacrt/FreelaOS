import { Request, Response } from 'express'
import { db } from '../database'

export const listarClientesPorParceiro = async (req: Request, res: Response) => {
  const { id } = req.params
  const [rows] = await db.query('SELECT * FROM clientes WHERE parceiro_id = ? ORDER BY nome', [id])
  res.json(rows)
}

export const atualizarCliente = async (req: Request, res: Response) => {
  const { id } = req.params
  const { nome } = req.body
  await db.query('UPDATE clientes SET nome = ? WHERE id = ?', [nome, id])
  res.json({ mensagem: 'Cliente atualizado' })
}

export const excluirCliente = async (req: Request, res: Response) => {
  const { id } = req.params
  await db.query('DELETE FROM clientes WHERE id = ?', [id])
  res.json({ mensagem: 'Cliente excluído' })
}
