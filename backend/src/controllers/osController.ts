import { Request, Response } from 'express'
import {
  createOS,
  getAllOS,
  getOSByNumero,
  updateOS,
  deleteOS
} from '../models/osModel'

export const listarOS = async (req: Request, res: Response) => {
  try {
    const ordens = await getAllOS()
    res.json(ordens)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar OSs' })
  }
}

export const buscarOS = async (req: Request, res: Response) => {
  try {
    const os = await getOSByNumero(req.params.numero)
    if (!os) return res.status(404).json({ erro: 'OS não encontrada' })
    res.json(os)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar OS' })
  }
}

export const criarOS = async (req: Request, res: Response) => {
  try {
    const novaOS = await createOS(req.body)
    res.status(201).json({ mensagem: 'OS criada com sucesso', os: novaOS })
  } catch (error) {
    console.error('❌ Erro ao criar OS:', error)
    res.status(500).json({
      erro: 'Erro ao criar OS',
      detalhe: error instanceof Error ? error.message : String(error)
    })
  }
}


export const atualizarOS = async (req: Request, res: Response) => {
  try {
    await updateOS(req.params.numero, req.body)
    res.status(200).json({ mensagem: 'OS atualizada com sucesso' })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar OS' })
  }
}

export const excluirOS = async (req: Request, res: Response) => {
  try {
    await deleteOS(req.params.numero)
    res.status(200).json({ mensagem: 'OS excluída com sucesso' })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir OS' })
  }
}
