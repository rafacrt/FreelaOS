import { Router } from 'express'
import {
  listarOS,
  buscarOS,
  criarOS,
  atualizarOS,
  excluirOS
} from '../controllers/osController'
import { duplicateOS } from '../controllers/osController'

const router = Router()

// Rotas principais de OS
router.get('/', listarOS)
router.get('/:numero', buscarOS)
router.post('/', criarOS)
router.put('/:numero', atualizarOS)
router.delete('/:numero', excluirOS)
router.post('/duplicar/:numero', duplicateOS)

export default router
