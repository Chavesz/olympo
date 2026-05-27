import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db/pool.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' })
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, nome, email, senha_hash, role, status FROM usuarios WHERE email = $1',
      [email.toLowerCase().trim()]
    )
    const user = rows[0]

    if (!user || !(await bcrypt.compare(senha, user.senha_hash))) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    if (user.status === 'inativo') {
      return res.status(403).json({ error: 'Conta inativa. Fale com a academia.' })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, nome: user.nome },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      token,
      user: { id: user.id, nome: user.nome, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error('Erro no login:', err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// POST /api/auth/cadastro
router.post('/cadastro', async (req, res) => {
  const { nome, email, senha, telefone, dataNascimento } = req.body
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const existing = await client.query('SELECT id FROM usuarios WHERE email = $1', [email.toLowerCase()])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' })
    }

    const senhaHash = await bcrypt.hash(senha, 10)
    const { rows: [usuario] } = await client.query(
      `INSERT INTO usuarios (nome, email, senha_hash, role)
       VALUES ($1, $2, $3, 'aluno') RETURNING id, nome, email, role`,
      [nome.trim(), email.toLowerCase().trim(), senhaHash]
    )

    await client.query(
      `INSERT INTO alunos (usuario_id, telefone, data_nascimento)
       VALUES ($1, $2, $3)`,
      [usuario.id, telefone || null, dataNascimento || null]
    )

    await client.query('COMMIT')

    const token = jwt.sign(
      { userId: usuario.id, email: usuario.email, role: usuario.role, nome: usuario.nome },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.status(201).json({
      token,
      user: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
    })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Erro no cadastro:', err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  } finally {
    client.release()
  }
})

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nome, email, role, status FROM usuarios WHERE id = $1',
      [req.user.userId]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router
