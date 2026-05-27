import { Router } from 'express'
import pool from '../db/pool.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

// GET /api/fichas — admin/instrutor vê todas; aluno vê as suas
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT
        ft.id, ft.titulo, ft.objetivo, ft.status, ft.criado_em, ft.atualizado_em,
        ua.nome AS aluno_nome,
        ui.nome AS instrutor_nome,
        a.id AS aluno_id,
        i.id AS instrutor_id
      FROM fichas_treino ft
      JOIN alunos a ON a.id = ft.aluno_id
      JOIN usuarios ua ON ua.id = a.usuario_id
      JOIN instrutores i ON i.id = ft.instrutor_id
      JOIN usuarios ui ON ui.id = i.usuario_id
    `
    const values = []

    if (req.user.role === 'aluno') {
      query += ` WHERE a.usuario_id = $1`
      values.push(req.user.userId)
    }

    query += ` ORDER BY ft.atualizado_em DESC`
    const { rows } = await pool.query(query, values)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar fichas' })
  }
})

// GET /api/fichas/:id (com exercícios)
router.get('/:id', async (req, res) => {
  try {
    const { rows: fichas } = await pool.query(`
      SELECT ft.*, ua.nome AS aluno_nome, ui.nome AS instrutor_nome
      FROM fichas_treino ft
      JOIN alunos a ON a.id = ft.aluno_id
      JOIN usuarios ua ON ua.id = a.usuario_id
      JOIN instrutores i ON i.id = ft.instrutor_id
      JOIN usuarios ui ON ui.id = i.usuario_id
      WHERE ft.id = $1
    `, [req.params.id])

    if (!fichas[0]) return res.status(404).json({ error: 'Ficha não encontrada' })

    const { rows: exercicios } = await pool.query(
      `SELECT id, nome, series, repeticoes, ordem
       FROM exercicios WHERE ficha_id = $1 ORDER BY ordem`,
      [req.params.id]
    )

    res.json({ ...fichas[0], exercicios })
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar ficha' })
  }
})

// POST /api/fichas
router.post('/', requireRole('admin', 'instrutor'), async (req, res) => {
  const { titulo, aluno_id, instrutor_id, objetivo, status, exercicios } = req.body
  if (!titulo || !aluno_id || !instrutor_id) {
    return res.status(400).json({ error: 'titulo, aluno_id e instrutor_id são obrigatórios' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: [ficha] } = await client.query(
      `INSERT INTO fichas_treino (titulo, aluno_id, instrutor_id, objetivo, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [titulo, aluno_id, instrutor_id, objetivo || null, status || 'ativa']
    )

    if (Array.isArray(exercicios) && exercicios.length > 0) {
      for (let idx = 0; idx < exercicios.length; idx++) {
        const ex = exercicios[idx]
        await client.query(
          `INSERT INTO exercicios (ficha_id, nome, series, repeticoes, ordem)
           VALUES ($1, $2, $3, $4, $5)`,
          [ficha.id, ex.nome, ex.series || null, ex.repeticoes || null, ex.ordem ?? idx]
        )
      }
    }

    await client.query('COMMIT')
    res.status(201).json(ficha)
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: 'Erro ao criar ficha' })
  } finally {
    client.release()
  }
})

// PATCH /api/fichas/:id
router.patch('/:id', requireRole('admin', 'instrutor'), async (req, res) => {
  const { titulo, objetivo, status, exercicios } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(
      `UPDATE fichas_treino
       SET titulo = COALESCE($1, titulo),
           objetivo = COALESCE($2, objetivo),
           status = COALESCE($3, status),
           atualizado_em = NOW()
       WHERE id = $4`,
      [titulo || null, objetivo || null, status || null, req.params.id]
    )

    if (Array.isArray(exercicios)) {
      await client.query('DELETE FROM exercicios WHERE ficha_id = $1', [req.params.id])
      for (let idx = 0; idx < exercicios.length; idx++) {
        const ex = exercicios[idx]
        await client.query(
          `INSERT INTO exercicios (ficha_id, nome, series, repeticoes, ordem)
           VALUES ($1, $2, $3, $4, $5)`,
          [req.params.id, ex.nome, ex.series || null, ex.repeticoes || null, ex.ordem ?? idx]
        )
      }
    }

    await client.query('COMMIT')
    res.json({ success: true })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: 'Erro ao atualizar ficha' })
  } finally {
    client.release()
  }
})

// DELETE /api/fichas/:id
router.delete('/:id', requireRole('admin', 'instrutor'), async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM fichas_treino WHERE id = $1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'Ficha não encontrada' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar ficha' })
  }
})

export default router
