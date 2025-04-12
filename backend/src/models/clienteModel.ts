import { db } from '../database'

export const verificarOuCriarCliente = async (nome: string, parceiroId: number): Promise<number> => {
  const [rows]: any = await db.query('SELECT id FROM clientes WHERE nome = ? AND parceiro_id = ?', [nome, parceiroId])
  if (rows.length > 0) return rows[0].id

  const [result]: any = await db.query(
    'INSERT INTO clientes (nome, parceiro_id) VALUES (?, ?)',
    [nome, parceiroId]
  )
  return result.insertId
}
