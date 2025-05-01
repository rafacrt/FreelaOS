import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'freelaos_jwt_secreto'

export interface AuthenticatedRequest extends Request {
  usuario?: { id: number; nome: string }
}

export const autenticarToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) return res.status(401).json({ erro: 'Token ausente' })

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    req.usuario = { id: payload.id, nome: payload.nome }
    next()
  } catch (err) {
    return res.status(403).json({ erro: 'Token inválido' })
  }
}
