import { Router } from 'express'
import { getAuthUrl, getTokens } from '../utils/googleCalendar'

const router = Router()

router.get('/login', (req, res) => {
  const url = getAuthUrl()
  res.redirect(url)
})

router.get('/callback', async (req, res) => {
  const code = req.query.code as string
  const tokens = await getTokens(code)
  // Salvar tokens em cookie ou banco, mas por ora mostra:
  res.json({ message: 'Autenticado com sucesso!', tokens })
})

export default router
