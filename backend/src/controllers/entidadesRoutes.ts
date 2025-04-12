import express from 'express'
import {
  listarParceiros,
  atualizarParceiro,
  excluirParceiro
} from '../controllers/parceiroController'
import {
  listarClientesPorParceiro,
  atualizarCliente,
  excluirCliente
} from '../controllers/clienteController'
import {
  listarProjetosPorCliente,
  atualizarProjeto,
  excluirProjeto
} from '../controllers/projetoController'

const router = express.Router()

router.get('/parceiros', listarParceiros)
router.get('/parceiros/:id/clientes', listarClientesPorParceiro)
router.get('/clientes/:id/projetos', listarProjetosPorCliente)

router.put('/parceiros/:id', atualizarParceiro)
router.delete('/parceiros/:id', excluirParceiro)

router.put('/clientes/:id', atualizarCliente)
router.delete('/clientes/:id', excluirCliente)

router.put('/projetos/:id', atualizarProjeto)
router.delete('/projetos/:id', excluirProjeto)

export default router
