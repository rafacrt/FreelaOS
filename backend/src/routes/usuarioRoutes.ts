import { Router } from 'express'
import {
  registrar,
  login,
  obterModoEscuro,
  salvarModoEscuro
} from '../controllers/usuarioController'
import { autenticarToken } from '../middlewares/authMiddleware'

const router = Router()

// Rotas públicas
router.post('/registrar', registrar)
router.post('/login', login)

// Preferência de modo escuro
router.get('/:id/modo-escuro', obterModoEscuro)
router.put('/:id/modo-escuro', salvarModoEscuro)

router.get('/protegida/teste', autenticarToken, (req, res) => {
    res.json({ mensagem: '🔐 Acesso autorizado à rota protegida!' })
  })

export default router
