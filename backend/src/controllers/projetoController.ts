import { Request, Response } from 'express'
import { db } from '../database'

export const listarProjetosPorCliente = async (req: Request, res: Response) => {
  const { id } = req.params
  const [rows] = await db.query('SELECT * FROM projetos WHERE cliente_id = ? ORDER BY nome', [id])
  res.json(rows)
}

export const atualizarProjeto = async (req: Request, res: Response) => {
  const { id } = req.params
  const { nome } = req.body
  await db.query('UPDATE projetos SET nome = ? WHERE id = ?', [nome, id])
  res.json({ mensagem: 'Projeto atualizado' })
}

export const excluirProjeto = async (req: Request, res: Response) => {
  const { id } = req.params
  await db.query('DELETE FROM projetos WHERE id = ?', [id])
  res.json({ mensagem: 'Projeto excluído' })
}
