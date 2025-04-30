import { db } from '../database'
import bcrypt from 'bcryptjs'

export interface Usuario {
  id?: number
  nome: string
  email: string
  senha: string
  modo_escuro?: number
}

export const criarUsuario = async (usuario: Usuario) => {
  const hash = await bcrypt.hash(usuario.senha, 10)
  const [res]: any = await db.query(
    'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
    [usuario.nome, usuario.email, hash]
  )
  return { id: res.insertId, ...usuario, senha: undefined }
}

export const buscarPorEmail = async (email: string) => {
  const [rows]: any = await db.query('SELECT * FROM usuarios WHERE email = ?', [email])
  return rows[0]
}

export const obterPreferenciaModoEscuro = async (id: number) => {
  const [res]: any = await db.query('SELECT modo_escuro FROM usuarios WHERE id = ?', [id])
  return res[0]?.modo_escuro === 1
}

export const atualizarPreferenciaModoEscuro = async (id: number, ativo: boolean) => {
  const [res] = await db.query(
    'UPDATE usuarios SET modo_escuro = ? WHERE id = ?',
    [ativo ? 1 : 0, id]
  )
  return res
}  
