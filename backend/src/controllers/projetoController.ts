import { Request, Response } from 'express'
import { db } from '../database'

// 🔄 Listar todos os projetos
export const listarTodosProjetos = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT nome FROM projetos ORDER BY nome')
    res.json(rows)
  } catch (err) {
    console.error('Erro ao listar projetos:', err)
    res.status(500).json({ erro: 'Erro ao listar projetos' })
  }
}

// 🔎 Listar projetos por cliente
export const listarProjetosPorCliente = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const [rows] = await db.query('SELECT * FROM projetos WHERE cliente_id = ? ORDER BY nome', [id])
    res.json(rows)
  } catch (err) {
    console.error('Erro ao listar projetos por cliente:', err)
    res.status(500).json({ erro: 'Erro ao listar projetos por cliente' })
  }
}

// ✏️ Atualizar projeto
export const atualizarProjeto = async (req: Request, res: Response) => {
  const { id } = req.params
  const { nome } = req.body
  try {
    await db.query('UPDATE projetos SET nome = ? WHERE id = ?', [nome, id])
    res.json({ mensagem: 'Projeto atualizado' })
  } catch (err) {
    console.error('Erro ao atualizar projeto:', err)
    res.status(500).json({ erro: 'Erro ao atualizar projeto' })
  }
}

// ❌ Excluir projeto
export const excluirProjeto = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    await db.query('DELETE FROM projetos WHERE id = ?', [id])
    res.json({ mensagem: 'Projeto excluído' })
  } catch (err) {
    console.error('Erro ao excluir projeto:', err)
    res.status(500).json({ erro: 'Erro ao excluir projeto' })
  }
}
