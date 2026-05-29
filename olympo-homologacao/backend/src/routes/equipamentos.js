import { Router } from 'express'
import pool from '../db/pool.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

router.get('/', requireRole('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT e.*, u.nome AS unidade_nome
      FROM equipamentos e
      LEFT JOIN unidades u ON u.id = e.unidade_id
      ORDER BY e.nome
    `)
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Erro ao buscar equipamentos' })
  }
})

router.post('/', requireRole('admin'), async (req, res) => {
  const { nome, categoria, quantidade, status, unidade_id } = req.body
  try {
    const { rows } = await pool.query(
      `INSERT INTO equipamentos (nome, categoria, quantidade, status, unidade_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nome, categoria, quantidade ?? 1, status || 'disponivel', unidade_id || null]
    )
    res.status(201).json(rows[0])
  } catch {
    res.status(500).json({ error: 'Erro ao criar equipamento' })
  }
})

router.patch('/:id', requireRole('admin'), async (req, res) => {
  const { nome, categoria, quantidade, status, unidade_id } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE equipamentos SET
        nome = COALESCE($1, nome), categoria = COALESCE($2, categoria),
        quantidade = COALESCE($3, quantidade), status = COALESCE($4, status),
        unidade_id = COALESCE($5, unidade_id), atualizado_em = NOW()
       WHERE id = $6 RETURNING *`,
      [nome, categoria, quantidade, status, unidade_id, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Equipamento não encontrado' })
    res.json(rows[0])
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar equipamento' })
  }
})

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM equipamentos WHERE id = $1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'Equipamento não encontrado' })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Erro ao excluir equipamento' })
  }
})

export default router
