import { Request, Response } from 'express'
import { db } from '../database'

// 🔄 Listar todos os clientes para autocomplete
export const listarTodosClientes = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT nome FROM clientes ORDER BY nome')
    res.json(rows)
  } catch (err) {
    console.error('Erro ao listar clientes:', err)
    res.status(500).json({ erro: 'Erro ao listar clientes' })
  }
}

// 🔎 Listar clientes por parceiro
export const listarClientesPorParceiro = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const [rows] = await db.query('SELECT * FROM clientes WHERE parceiro_id = ? ORDER BY nome', [id])
    res.json(rows)
  } catch (err) {
    console.error('Erro ao listar clientes por parceiro:', err)
    res.status(500).json({ erro: 'Erro ao listar clientes por parceiro' })
  }
}

// ✏️ Atualizar nome do cliente
export const atualizarCliente = async (req: Request, res: Response) => {
  const { id } = req.params
  const { nome } = req.body
  try {
    await db.query('UPDATE clientes SET nome = ? WHERE id = ?', [nome, id])
    res.json({ mensagem: 'Cliente atualizado' })
  } catch (err) {
    console.error('Erro ao atualizar cliente:', err)
    res.status(500).json({ erro: 'Erro ao atualizar cliente' })
  }
}

// ❌ Excluir cliente
export const excluirCliente = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    await db.query('DELETE FROM clientes WHERE id = ?', [id])
    res.json({ mensagem: 'Cliente excluído' })
  } catch (err) {
    console.error('Erro ao excluir cliente:', err)
    res.status(500).json({ erro: 'Erro ao excluir cliente' })
  }
}
