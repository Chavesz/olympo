import { Router } from 'express'
import pool from '../db/pool.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM unidades ORDER BY nome')
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Erro ao buscar unidades' })
  }
})

router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  const { nome, endereco, telefone, horario, imagem_key, plano_mensal, plano_anual } = req.body
  try {
    const { rows } = await pool.query(
      `INSERT INTO unidades (nome, endereco, telefone, horario, imagem_key, plano_mensal, plano_anual)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nome, endereco, telefone, horario, imagem_key, plano_mensal, plano_anual]
    )
    res.status(201).json(rows[0])
  } catch {
    res.status(500).json({ error: 'Erro ao criar unidade' })
  }
})

router.patch('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const { nome, endereco, telefone, horario, imagem_key, plano_mensal, plano_anual } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE unidades SET
        nome = COALESCE($1, nome), endereco = COALESCE($2, endereco),
        telefone = COALESCE($3, telefone), horario = COALESCE($4, horario),
        imagem_key = COALESCE($5, imagem_key), plano_mensal = COALESCE($6, plano_mensal),
        plano_anual = COALESCE($7, plano_anual), atualizado_em = NOW()
       WHERE id = $8 RETURNING *`,
      [nome, endereco, telefone, horario, imagem_key, plano_mensal, plano_anual, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Unidade não encontrada' })
    res.json(rows[0])
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar unidade' })
  }
})

router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM unidades WHERE id = $1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'Unidade não encontrada' })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Erro ao excluir unidade' })
  }
})

export default router
