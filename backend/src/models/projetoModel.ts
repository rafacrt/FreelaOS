import { db } from '../database'

export const verificarOuCriarProjeto = async (
  nome: string,
  clienteId: number,
  parceiroId: number
): Promise<number> => {
  const [rows]: any = await db.query(
    'SELECT id FROM projetos WHERE nome = ? AND cliente_id = ? AND parceiro_id = ?',
    [nome, clienteId, parceiroId]
  )
  if (rows.length > 0) return rows[0].id

  const [result]: any = await db.query(
    'INSERT INTO projetos (nome, cliente_id, parceiro_id) VALUES (?, ?, ?)',
    [nome, clienteId, parceiroId]
  )
  return result.insertId
} 
