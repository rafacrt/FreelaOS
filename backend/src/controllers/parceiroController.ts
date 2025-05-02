import { Request, Response } from 'express'
import { db } from '../database'

export const listarParceiros = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM parceiros ORDER BY nome')
    res.json(rows)
  } catch (err) {
    console.error('Erro ao listar parceiros:', err)
    res.status(500).json({ erro: 'Erro ao listar parceiros' })
  }
}

export const listarTodosParceiros = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT nome FROM parceiros ORDER BY nome')
    res.json(rows)
  } catch (err) {
    console.error('Erro ao listar parceiros:', err)
    res.status(500).json({ erro: 'Erro ao listar parceiros' })
  }
}

export const atualizarParceiro = async (req: Request, res: Response) => {
  const { id } = req.params
  const { nome } = req.body
  try {
    await db.query('UPDATE parceiros SET nome = ? WHERE id = ?', [nome, id])
    res.json({ mensagem: 'Parceiro atualizado' })
  } catch (err) {
    console.error('Erro ao atualizar parceiro:', err)
    res.status(500).json({ erro: 'Erro ao atualizar parceiro' })
  }
}

export const excluirParceiro = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    await db.query('DELETE FROM parceiros WHERE id = ?', [id])
    res.json({ mensagem: 'Parceiro excluído' })
  } catch (err) {
    console.error('Erro ao excluir parceiro:', err)
    res.status(500).json({ erro: 'Erro ao excluir parceiro' })
  }
}
