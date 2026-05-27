import { Router } from 'express'
import bcrypt from 'bcryptjs'
import pool from '../db/pool.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

// GET /api/usuarios — apenas admin
router.get('/', requireRole('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nome, email, role, status, criado_em FROM usuarios ORDER BY criado_em DESC`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários' })
  }
})

// POST /api/usuarios — admin cria usuário
router.post('/', requireRole('admin'), async (req, res) => {
  const { nome, email, senha, role, status } = req.body
  if (!nome || !email || !senha || !role) {
    return res.status(400).json({ error: 'Campos obrigatórios: nome, email, senha, role' })
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10)
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, role, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, email, role, status`,
      [nome, email.toLowerCase(), senhaHash, role, status || 'ativo']
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email já cadastrado' })
    res.status(500).json({ error: 'Erro ao criar usuário' })
  }
})

// PATCH /api/usuarios/:id
router.patch('/:id', requireRole('admin'), async (req, res) => {
  const { nome, email, role, status, senha } = req.body
  const updates = []
  const values = []
  let i = 1

  if (nome)   { updates.push(`nome = $${i++}`);   values.push(nome) }
  if (email)  { updates.push(`email = $${i++}`);  values.push(email.toLowerCase()) }
  if (role)   { updates.push(`role = $${i++}`);   values.push(role) }
  if (status) { updates.push(`status = $${i++}`); values.push(status) }
  if (senha)  { updates.push(`senha_hash = $${i++}`); values.push(await bcrypt.hash(senha, 10)) }

  if (!updates.length) return res.status(400).json({ error: 'Nenhum campo para atualizar' })

  updates.push(`atualizado_em = NOW()`)
  values.push(req.params.id)

  try {
    const { rows } = await pool.query(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id = $${i} RETURNING id, nome, email, role, status`,
      values
    )
    if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar usuário' })
  }
})

// DELETE /api/usuarios/:id
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM usuarios WHERE id = $1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'Usuário não encontrado' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar usuário' })
  }
})

export default router
