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
  const { nome, email, senha, role, status, telefone, cref, especialidade, plano_id } = req.body
  if (!nome || !email || !role) {
    return res.status(400).json({ error: 'Campos obrigatórios: nome, email, role' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const senhaHash = await bcrypt.hash(senha || '123456', 10)
    const { rows: [usuario] } = await client.query(
      `INSERT INTO usuarios (nome, email, senha_hash, role, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, email, role, status`,
      [nome.trim(), email.toLowerCase().trim(), senhaHash, role, status || 'ativo']
    )

    if (role === 'aluno') {
      await client.query(
        `INSERT INTO alunos (usuario_id, telefone, plano_id, status)
         VALUES ($1, $2, $3, $4)`,
        [usuario.id, telefone || null, plano_id || null, status || 'ativo']
      )
    }
    if (role === 'instrutor') {
      await client.query(
        `INSERT INTO instrutores (usuario_id, cref, especialidade, status)
         VALUES ($1, $2, $3, $4)`,
        [usuario.id, cref || '', especialidade || '', status || 'ativo']
      )
    }

    await client.query('COMMIT')
    res.status(201).json(usuario)
  } catch (err) {
    await client.query('ROLLBACK')
    if (err.code === '23505') return res.status(409).json({ error: 'Email já cadastrado' })
    res.status(500).json({ error: 'Erro ao criar usuário' })
  } finally {
    client.release()
  }
})

// PATCH /api/usuarios/:id
router.patch('/:id', requireRole('admin'), async (req, res) => {
  const { nome, email, role, status, senha, telefone, cref, especialidade, plano_id } = req.body
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

    const user = rows[0]
    if (user.role === 'aluno' && (telefone !== undefined || plano_id !== undefined || status !== undefined)) {
      await pool.query(
        `UPDATE alunos SET
          telefone = COALESCE($1, telefone),
          plano_id = COALESCE($2, plano_id),
          status = COALESCE($3, status),
          atualizado_em = NOW()
         WHERE usuario_id = $4`,
        [telefone ?? null, plano_id ?? null, status ?? null, req.params.id]
      )
    }
    if (user.role === 'instrutor' && (cref !== undefined || especialidade !== undefined || status !== undefined)) {
      await pool.query(
        `UPDATE instrutores SET
          cref = COALESCE($1, cref),
          especialidade = COALESCE($2, especialidade),
          status = COALESCE($3, status),
          atualizado_em = NOW()
         WHERE usuario_id = $4`,
        [cref ?? null, especialidade ?? null, status ?? null, req.params.id]
      )
    }

    res.json(user)
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
