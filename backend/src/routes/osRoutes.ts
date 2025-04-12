import { Router } from 'express'
import {
  listarOS,
  buscarOS,
  criarOS,
  atualizarOS,
  excluirOS
} from '../controllers/osController'

const router = Router()

// Rotas principais de OS
router.get('/', listarOS)
router.get('/:numero', buscarOS)
router.post('/', criarOS)
router.put('/:numero', atualizarOS)
router.delete('/:numero', excluirOS)

export default router
