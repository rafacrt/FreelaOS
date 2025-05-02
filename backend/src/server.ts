import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import osRoutes from './routes/osRoutes'
import entidadesRoutes from './routes/entidadesRoutes';
import googleAuthRoutes from './routes/googleAuth'
import usuarioRoutes from './routes/usuarioRoutes'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/os', osRoutes);
app.use('/entidades', entidadesRoutes);
app.use('/auth/google', googleAuthRoutes);
app.use('/usuarios', usuarioRoutes)
app.get('/test-db', (_, res) => {
  res.json({ ok: true })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 API FreelaOS rodando na porta ${PORT}`)
})

process.on('uncaughtException', err => {
  console.error('Erro não capturado:', err);
});
process.on('unhandledRejection', err => {
  console.error('Promessa não tratada:', err);
});

