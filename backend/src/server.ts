import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import osRoutes from './routes/osRoutes'
import entidadesRoutes from './routes/entidadesRoutes'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/os', osRoutes)
app.use('/entidades', entidadesRoutes)

app.get('/test-db', (_, res) => {
  res.json({ ok: true })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 API FreelaOS rodando na porta ${PORT}`)
})
