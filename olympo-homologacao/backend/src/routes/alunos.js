import { Router } from 'express'
import bcrypt from 'bcryptjs'
import pool from '../db/pool.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

const alunoQuery = `
  SELECT
    a.id, a.usuario_id, a.telefone, a.data_nascimento, a.data_matricula, a.status, a.plano_id,
    u.nome, u.email,
    p.nome AS plano_ativo
  FROM alunos a
  JOIN usuarios u ON u.id = a.usuario_id
  LEFT JOIN planos p ON p.id = a.plano_id
`

// GET /api/alunos/me — perfil do aluno logado
router.get('/me', requireRole('aluno'), async (req, res) => {
  try {
    const { rows } = await pool.query(`${alunoQuery} WHERE a.usuario_id = $1`, [req.user.userId])
    if (!rows[0]) return res.status(404).json({ error: 'Perfil de aluno não encontrado' })
    res.json(rows[0])
  } catch {
    res.status(500).json({ error: 'Erro ao buscar perfil' })
  }
})

// GET /api/alunos
router.get('/', requireRole('admin', 'instrutor'), async (req, res) => {
  try {
    const { rows } = await pool.query(`${alunoQuery} ORDER BY u.nome`)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar alunos' })
  }
})

// POST /api/alunos — cadastro presencial (usuário + aluno)
router.post('/', requireRole('admin', 'instrutor'), async (req, res) => {
  const { nome, email, telefone, data_nascimento, data_matricula, plano_id, status, senha } = req.body
  if (!nome?.trim() || !email?.trim()) {
    return res.status(400).json({ error: 'Nome e e-mail são obrigatórios' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const senhaHash = await bcrypt.hash(senha || '123456', 10)
    const { rows: [usuario] } = await client.query(
      `INSERT INTO usuarios (nome, email, senha_hash, role, status)
       VALUES ($1, $2, $3, 'aluno', $4) RETURNING id`,
      [nome.trim(), email.toLowerCase().trim(), senhaHash, status || 'ativo']
    )
    const { rows: [aluno] } = await client.query(
      `INSERT INTO alunos (usuario_id, telefone, data_nascimento, data_matricula, plano_id, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        usuario.id,
        telefone || null,
        data_nascimento || null,
        data_matricula || new Date(),
        plano_id || null,
        status || 'ativo',
      ]
    )
    await client.query('COMMIT')
    const { rows: [full] } = await pool.query(`${alunoQuery} WHERE a.id = $1`, [aluno.id])
    res.status(201).json(full)
  } catch (err) {
    await client.query('ROLLBACK')
    if (err.code === '23505') return res.status(409).json({ error: 'E-mail já cadastrado' })
    res.status(500).json({ error: 'Erro ao criar aluno' })
  } finally {
    client.release()
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

// DELETE /api/alunos/:id
router.delete('/:id', requireRole('admin', 'instrutor'), async (req, res) => {
  try {
    const { rows: [aluno] } = await pool.query('SELECT usuario_id FROM alunos WHERE id = $1', [req.params.id])
    if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' })
    await pool.query('DELETE FROM usuarios WHERE id = $1', [aluno.usuario_id])
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Erro ao excluir aluno' })
  }
})

// PATCH /api/alunos/:id
router.patch('/:id', requireRole('admin', 'instrutor'), async (req, res) => {
  const { nome, email, telefone, data_nascimento, data_matricula, plano_id, status } = req.body
  const updates = []
  const values = []
  let i = 1

  if (telefone !== undefined)        { updates.push(`telefone = $${i++}`);        values.push(telefone) }
  if (data_nascimento !== undefined) { updates.push(`data_nascimento = $${i++}`); values.push(data_nascimento) }
  if (data_matricula !== undefined)  { updates.push(`data_matricula = $${i++}`);  values.push(data_matricula) }
  if (plano_id !== undefined)        { updates.push(`plano_id = $${i++}`);        values.push(plano_id) }
  if (status !== undefined)          { updates.push(`status = $${i++}`);          values.push(status) }

  try {
    if (updates.length) {
      updates.push(`atualizado_em = NOW()`)
      values.push(req.params.id)
      const { rows } = await pool.query(
        `UPDATE alunos SET ${updates.join(', ')} WHERE id = $${i} RETURNING id`,
        values
      )
      if (!rows[0]) return res.status(404).json({ error: 'Aluno não encontrado' })
    }

    if (nome !== undefined || email !== undefined || status !== undefined) {
      const { rows: [aluno] } = await pool.query('SELECT usuario_id FROM alunos WHERE id = $1', [req.params.id])
      if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' })
      const uUpdates = []
      const uValues = []
      let j = 1
      if (nome !== undefined)   { uUpdates.push(`nome = $${j++}`);   uValues.push(nome.trim()) }
      if (email !== undefined)  { uUpdates.push(`email = $${j++}`);  uValues.push(email.toLowerCase().trim()) }
      if (status !== undefined) { uUpdates.push(`status = $${j++}`); uValues.push(status) }
      if (uUpdates.length) {
        uUpdates.push(`atualizado_em = NOW()`)
        uValues.push(aluno.usuario_id)
        await pool.query(`UPDATE usuarios SET ${uUpdates.join(', ')} WHERE id = $${j}`, uValues)
      }
    }

    const { rows: updated } = await pool.query(`${alunoQuery} WHERE a.id = $1`, [req.params.id])
    if (!updated[0]) return res.status(404).json({ error: 'Aluno não encontrado' })
    res.json(updated[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'E-mail já cadastrado' })
    res.status(500).json({ error: 'Erro ao atualizar aluno' })
  }
})

// GET /api/alunos/me/avaliacoes
router.get('/me/avaliacoes', requireRole('aluno'), async (req, res) => {
  try {
    const { rows: [aluno] } = await pool.query('SELECT id FROM alunos WHERE usuario_id = $1', [req.user.userId])
    if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' })
    const { rows } = await pool.query(
      `SELECT av.*, u.nome AS instrutor_nome
       FROM avaliacoes av
       LEFT JOIN instrutores i ON i.id = av.instrutor_id
       LEFT JOIN usuarios u ON u.id = i.usuario_id
       WHERE av.aluno_id = $1
       ORDER BY av.data_avaliacao DESC`,
      [aluno.id]
    )
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Erro ao buscar avaliações' })
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
