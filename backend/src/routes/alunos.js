import { Router } from 'express'
import pool from '../db/pool.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

const alunoQuery = `
  SELECT
    a.id, a.telefone, a.data_nascimento, a.data_matricula, a.status,
    u.nome, u.email,
    p.nome AS plano_ativo
  FROM alunos a
  JOIN usuarios u ON u.id = a.usuario_id
  LEFT JOIN planos p ON p.id = a.plano_id
`

// GET /api/alunos
router.get('/', requireRole('admin', 'instrutor'), async (req, res) => {
  try {
    const { rows } = await pool.query(`${alunoQuery} ORDER BY u.nome`)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar alunos' })
  }
})

// GET /api/alunos/:id
router.get('/:id', requireRole('admin', 'instrutor'), async (req, res) => {
  try {
    const { rows } = await pool.query(`${alunoQuery} WHERE a.id = $1`, [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Aluno não encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar aluno' })
  }
})

// PATCH /api/alunos/:id
router.patch('/:id', requireRole('admin', 'instrutor'), async (req, res) => {
  const { telefone, data_nascimento, plano_id, status } = req.body
  const updates = []
  const values = []
  let i = 1

  if (telefone !== undefined)        { updates.push(`telefone = $${i++}`);        values.push(telefone) }
  if (data_nascimento !== undefined) { updates.push(`data_nascimento = $${i++}`); values.push(data_nascimento) }
  if (plano_id !== undefined)        { updates.push(`plano_id = $${i++}`);        values.push(plano_id) }
  if (status !== undefined)          { updates.push(`status = $${i++}`);          values.push(status) }

  if (!updates.length) return res.status(400).json({ error: 'Nenhum campo para atualizar' })

  updates.push(`atualizado_em = NOW()`)
  values.push(req.params.id)

  try {
    const { rows } = await pool.query(
      `UPDATE alunos SET ${updates.join(', ')} WHERE id = $${i} RETURNING id`,
      values
    )
    if (!rows[0]) return res.status(404).json({ error: 'Aluno não encontrado' })

    const { rows: updated } = await pool.query(`${alunoQuery} WHERE a.id = $1`, [req.params.id])
    res.json(updated[0])
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar aluno' })
  }
})

// GET /api/alunos/:id/avaliacoes
router.get('/:id/avaliacoes', requireRole('admin', 'instrutor'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT av.*, u.nome AS instrutor_nome
       FROM avaliacoes av
       LEFT JOIN instrutores i ON i.id = av.instrutor_id
       LEFT JOIN usuarios u ON u.id = i.usuario_id
       WHERE av.aluno_id = $1
       ORDER BY av.data_avaliacao DESC`,
      [req.params.id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar avaliações' })
  }
})

// POST /api/alunos/:id/avaliacoes
router.post('/:id/avaliacoes', requireRole('admin', 'instrutor'), async (req, res) => {
  const { peso, altura, gordura_pct, observacao, data_avaliacao, instrutor_id } = req.body
  try {
    const { rows } = await pool.query(
      `INSERT INTO avaliacoes (aluno_id, instrutor_id, peso, altura, gordura_pct, observacao, data_avaliacao)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.params.id, instrutor_id || null, peso, altura, gordura_pct, observacao, data_avaliacao || new Date()]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar avaliação' })
  }
})

export default router
