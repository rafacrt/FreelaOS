import express from 'express'
import {
  listarParceiros,
  listarTodosParceiros, // ✅ novo
  atualizarParceiro,
  excluirParceiro
} from '../controllers/parceiroController'

import {
  listarClientesPorParceiro,
  listarTodosClientes, // ✅ novo
  atualizarCliente,
  excluirCliente
} from '../controllers/clienteController'

import {
  listarProjetosPorCliente,
  listarTodosProjetos, // ✅ novo
  atualizarProjeto,
  excluirProjeto
} from '../controllers/projetoController'

const router = express.Router()

// 🔽 Novas rotas
router.get('/clientes', listarTodosClientes)
router.get('/parceiros/todos', listarTodosParceiros)
router.get('/projetos/todos', listarTodosProjetos)

// Já existentes
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
