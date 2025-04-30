import { Router } from 'express'
import {
  registrar,
  login,
  obterModoEscuro,
  salvarModoEscuro
} from '../controllers/usuarioController'

const router = Router()

// Rotas públicas
router.post('/registrar', registrar)
router.post('/login', login)

// Preferência de modo escuro
router.get('/:id/modo-escuro', obterModoEscuro)
router.put('/:id/modo-escuro', salvarModoEscuro)

export default router
