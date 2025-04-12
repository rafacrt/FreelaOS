import { db } from '../database'

export const verificarOuCriarParceiro = async (nome: string): Promise<number> => {
  const [rows]: any = await db.query('SELECT id FROM parceiros WHERE nome = ?', [nome])
  if (rows.length > 0) return rows[0].id

  const [result]: any = await db.query('INSERT INTO parceiros (nome) VALUES (?)', [nome])
  return result.insertId
}