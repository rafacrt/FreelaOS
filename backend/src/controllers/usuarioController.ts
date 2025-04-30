import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import {
  criarUsuario,
  buscarPorEmail,
  atualizarPreferenciaModoEscuro,
  obterPreferenciaModoEscuro
} from '../models/usuarioModel'

const JWT_SECRET = process.env.JWT_SECRET || 'freelaos_jwt_secreto'

export const registrar = async (req: Request, res: Response) => {
  const { nome, email, senha } = req.body
  try {
    const existente = await buscarPorEmail(email)
    if (existente) return res.status(400).json({ erro: 'Email já registrado' })

    const novoUsuario = await criarUsuario({ nome, email, senha })
    res.status(201).json(novoUsuario)
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao registrar usuário' })
  }
}

export const login = async (req: Request, res: Response) => {
  const { email, senha } = req.body
  try {
    const usuario = await buscarPorEmail(email)
    if (!usuario) return res.status(401).json({ erro: 'Credenciais inválidas' })

    const match = await bcrypt.compare(senha, usuario.senha)
    if (!match) return res.status(401).json({ erro: 'Credenciais inválidas' })

    const token = jwt.sign({ id: usuario.id, nome: usuario.nome }, JWT_SECRET, { expiresIn: '7d' })
    res.status(200).json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao fazer login' })
  }
}

export const salvarModoEscuro = async (req: Request, res: Response) => {
  const { id } = req.params
  const { ativo } = req.body
  try {
    await atualizarPreferenciaModoEscuro(Number(id), ativo)
    res.status(200).json({ sucesso: true })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao salvar modo escuro' })
  }
}

export const obterModoEscuro = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const ativo = await obterPreferenciaModoEscuro(Number(id))
    res.status(200).json({ modoEscuro: ativo })
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar preferência' })
  }
}