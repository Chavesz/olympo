import { Router } from 'express'
import bcrypt from 'bcryptjs'
import pool from '../db/pool.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

const instrutorQuery = `
  SELECT i.id, i.cref, i.especialidade, i.status, u.nome, u.email
  FROM instrutores i
  JOIN usuarios u ON u.id = i.usuario_id
`

// GET /api/instrutores
router.get('/', requireRole('admin', 'instrutor'), async (req, res) => {
  try {
    const { rows } = await pool.query(`${instrutorQuery} ORDER BY u.nome`)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar instrutores' })
  }
})

// POST /api/instrutores
router.post('/', requireRole('admin'), async (req, res) => {
  const { nome, email, cref, especialidade, status, senha, usuario_id } = req.body

  try {
    let userId = usuario_id
    if (!userId) {
      if (!nome?.trim() || !email?.trim() || !cref?.trim()) {
        return res.status(400).json({ error: 'Nome, e-mail e CREF são obrigatórios' })
      }
      const senhaHash = await bcrypt.hash(senha || '123456', 10)
      const { rows: [usuario] } = await pool.query(
        `INSERT INTO usuarios (nome, email, senha_hash, role, status)
         VALUES ($1, $2, $3, 'instrutor', $4) RETURNING id`,
        [nome.trim(), email.toLowerCase().trim(), senhaHash, status || 'ativo']
      )
      userId = usuario.id
    }

    const { rows: [instrutor] } = await pool.query(
      `INSERT INTO instrutores (usuario_id, cref, especialidade, status)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [userId, cref, especialidade, status || 'ativo']
    )
    const { rows: [full] } = await pool.query(`${instrutorQuery} WHERE i.id = $1`, [instrutor.id])
    res.status(201).json(full)
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'E-mail já cadastrado' })
    res.status(500).json({ error: 'Erro ao criar instrutor' })
  }
})

// GET /api/instrutores/:id
router.get('/:id', requireRole('admin', 'instrutor'), async (req, res) => {
  try {
    const { rows } = await pool.query(`${instrutorQuery} WHERE i.id = $1`, [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Instrutor não encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar instrutor' })
  }
})

// PATCH /api/instrutores/:id
router.patch('/:id', requireRole('admin'), async (req, res) => {
  const { cref, especialidade, status } = req.body
  const updates = []
  const values = []
  let i = 1

  if (cref !== undefined)         { updates.push(`cref = $${i++}`);         values.push(cref) }
  if (especialidade !== undefined){ updates.push(`especialidade = $${i++}`); values.push(especialidade) }
  if (status !== undefined)       { updates.push(`status = $${i++}`);       values.push(status) }

  if (!updates.length) return res.status(400).json({ error: 'Nenhum campo para atualizar' })

  updates.push(`atualizado_em = NOW()`)
  values.push(req.params.id)

  try {
    const { rows } = await pool.query(
      `UPDATE instrutores SET ${updates.join(', ')} WHERE id = $${i} RETURNING id`,
      values
    )
    if (!rows[0]) return res.status(404).json({ error: 'Instrutor não encontrado' })
    const { rows: updated } = await pool.query(`${instrutorQuery} WHERE i.id = $1`, [req.params.id])
    res.json(updated[0])
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar instrutor' })
  }
})

// DELETE /api/instrutores/:id
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { rows: [instrutor] } = await pool.query('SELECT usuario_id FROM instrutores WHERE id = $1', [req.params.id])
    if (!instrutor) return res.status(404).json({ error: 'Instrutor não encontrado' })
    await pool.query('DELETE FROM usuarios WHERE id = $1', [instrutor.usuario_id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir instrutor' })
  }
})

export default router
