import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRouter from './routes/auth.js'
import usuariosRouter from './routes/usuarios.js'
import alunosRouter from './routes/alunos.js'
import instrutoresRouter from './routes/instrutores.js'
import fichasRouter from './routes/fichas.js'
import {
  planosRouter,
  eventosRouter,
  aulasRouter,
  inscricoesRouter,
  comunicadosRouter,
  historicoRouter,
  progressoRouter,
} from './routes/portal.js'
import unidadesRouter from './routes/unidades.js'
import equipamentosRouter from './routes/equipamentos.js'

const app = express()

// ── Middlewares ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// ── Rotas ─────────────────────────────────────────────────────
app.use('/api/auth',        authRouter)
app.use('/api/usuarios',    usuariosRouter)
app.use('/api/alunos',      alunosRouter)
app.use('/api/instrutores', instrutoresRouter)
app.use('/api/fichas',      fichasRouter)
app.use('/api/planos',      planosRouter)
app.use('/api/eventos',     eventosRouter)
app.use('/api/aulas',       aulasRouter)
app.use('/api/inscricoes',  inscricoesRouter)
app.use('/api/comunicados', comunicadosRouter)
app.use('/api/historico',   historicoRouter)
app.use('/api/progresso',   progressoRouter)
app.use('/api/unidades',    unidadesRouter)
app.use('/api/equipamentos', equipamentosRouter)

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada' }))

// ── Erro global ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor' })
})

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`\n🚀 Olympo Backend rodando em http://localhost:${PORT}`)
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Health:   http://localhost:${PORT}/health\n`)
})
