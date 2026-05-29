import { Router } from 'express'
import pool from '../db/pool.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

// ──────────────────────────────────────────────────────────────
// PLANOS
// ──────────────────────────────────────────────────────────────
export const planosRouter = Router()
planosRouter.use(authMiddleware)

planosRouter.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM planos ORDER BY valor')
    res.json(rows)
  } catch { res.status(500).json({ error: 'Erro ao buscar planos' }) }
})

planosRouter.post('/', requireRole('admin'), async (req, res) => {
  const { nome, tipo, valor, descricao, status } = req.body
  try {
    const { rows } = await pool.query(
      `INSERT INTO planos (nome, tipo, valor, descricao, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nome, tipo, valor, descricao, status || 'ativo']
    )
    res.status(201).json(rows[0])
  } catch { res.status(500).json({ error: 'Erro ao criar plano' }) }
})

planosRouter.patch('/:id', requireRole('admin'), async (req, res) => {
  const { nome, tipo, valor, descricao, status } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE planos SET
        nome = COALESCE($1, nome), tipo = COALESCE($2, tipo),
        valor = COALESCE($3, valor), descricao = COALESCE($4, descricao),
        status = COALESCE($5, status), atualizado_em = NOW()
       WHERE id = $6 RETURNING *`,
      [nome, tipo, valor, descricao, status, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Plano não encontrado' })
    res.json(rows[0])
  } catch { res.status(500).json({ error: 'Erro ao atualizar plano' }) }
})

planosRouter.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM planos WHERE id = $1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'Plano não encontrado' })
    res.json({ success: true })
  } catch { res.status(500).json({ error: 'Erro ao deletar plano' }) }
})

// ──────────────────────────────────────────────────────────────
// EVENTOS
// ──────────────────────────────────────────────────────────────
export const eventosRouter = Router()
eventosRouter.use(authMiddleware)

eventosRouter.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT e.*,
        (SELECT COUNT(*) FROM inscricoes WHERE evento_id = e.id AND tipo = 'evento') AS inscritos
      FROM eventos e ORDER BY e.data
    `)
    res.json(rows)
  } catch { res.status(500).json({ error: 'Erro ao buscar eventos' }) }
})

eventosRouter.post('/', requireRole('admin', 'instrutor'), async (req, res) => {
  const { nome, data, horario, local, descricao, vagas } = req.body
  try {
    const { rows } = await pool.query(
      `INSERT INTO eventos (nome, data, horario, local, descricao, vagas)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nome, data, horario, local, descricao, vagas || 0]
    )
    res.status(201).json(rows[0])
  } catch { res.status(500).json({ error: 'Erro ao criar evento' }) }
})

eventosRouter.patch('/:id', requireRole('admin', 'instrutor'), async (req, res) => {
  const { nome, data, horario, local, descricao, vagas } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE eventos SET
        nome = COALESCE($1, nome), data = COALESCE($2, data),
        horario = COALESCE($3, horario), local = COALESCE($4, local),
        descricao = COALESCE($5, descricao), vagas = COALESCE($6, vagas),
        atualizado_em = NOW()
       WHERE id = $7 RETURNING *`,
      [nome, data, horario, local, descricao, vagas, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Evento não encontrado' })
    res.json(rows[0])
  } catch { res.status(500).json({ error: 'Erro ao atualizar evento' }) }
})

eventosRouter.delete('/:id', requireRole('admin', 'instrutor'), async (req, res) => {
  try {
    await pool.query('DELETE FROM eventos WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch { res.status(500).json({ error: 'Erro ao deletar evento' }) }
})

// ──────────────────────────────────────────────────────────────
// AULAS COLETIVAS
// ──────────────────────────────────────────────────────────────
export const aulasRouter = Router()
aulasRouter.use(authMiddleware)

aulasRouter.get('/', async (req, res) => {
  try {
    const { rows: modalidades } = await pool.query('SELECT * FROM modalidades ORDER BY nome')
    const result = []
    for (const mod of modalidades) {
      const { rows: slots } = await pool.query(`
        SELECT s.*,
          (SELECT COUNT(*) FROM inscricoes WHERE slot_id = s.id AND tipo = 'aula') AS inscritos
        FROM aulas_slots s WHERE s.modalidade_id = $1 ORDER BY s.dia_semana, s.horario
      `, [mod.id])
      result.push({ ...mod, slots })
    }
    res.json(result)
  } catch { res.status(500).json({ error: 'Erro ao buscar aulas' }) }
})

aulasRouter.post('/slots', requireRole('admin', 'instrutor'), async (req, res) => {
  const { modalidade_id, dia_semana, horario, vagas } = req.body
  try {
    const { rows } = await pool.query(
      `INSERT INTO aulas_slots (modalidade_id, dia_semana, horario, vagas)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [modalidade_id, dia_semana, horario, vagas || 20]
    )
    res.status(201).json(rows[0])
  } catch { res.status(500).json({ error: 'Erro ao criar slot' }) }
})

aulasRouter.delete('/slots/:id', requireRole('admin', 'instrutor'), async (req, res) => {
  try {
    await pool.query('DELETE FROM aulas_slots WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch { res.status(500).json({ error: 'Erro ao deletar slot' }) }
})

// ──────────────────────────────────────────────────────────────
// INSCRIÇÕES (eventos e aulas)
// ──────────────────────────────────────────────────────────────
export const inscricoesRouter = Router()
inscricoesRouter.use(authMiddleware)

inscricoesRouter.get('/', requireRole('admin', 'instrutor'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT i.*, u.nome AS usuario_nome, u.email AS usuario_email,
              e.nome AS evento_nome, e.data AS evento_data, e.horario AS evento_horario,
              m.nome AS modalidade_nome, s.dia_semana, s.horario AS slot_horario
       FROM inscricoes i
       JOIN usuarios u ON u.id = i.usuario_id
       LEFT JOIN eventos e ON e.id = i.evento_id
       LEFT JOIN aulas_slots s ON s.id = i.slot_id
       LEFT JOIN modalidades m ON m.id = s.modalidade_id
       ORDER BY i.data_inscricao DESC`
    )
    res.json(rows)
  } catch { res.status(500).json({ error: 'Erro ao buscar inscrições' }) }
})

inscricoesRouter.get('/minhas', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT i.*, e.nome AS evento_nome, e.data AS evento_data,
              m.nome AS modalidade_nome, s.dia_semana, s.horario
       FROM inscricoes i
       LEFT JOIN eventos e ON e.id = i.evento_id
       LEFT JOIN aulas_slots s ON s.id = i.slot_id
       LEFT JOIN modalidades m ON m.id = s.modalidade_id
       WHERE i.usuario_id = $1 ORDER BY i.data_inscricao DESC`,
      [req.user.userId]
    )
    res.json(rows)
  } catch { res.status(500).json({ error: 'Erro ao buscar inscrições' }) }
})

inscricoesRouter.post('/', async (req, res) => {
  const { tipo, evento_id, slot_id } = req.body
  try {
    const { rows } = await pool.query(
      `INSERT INTO inscricoes (usuario_id, tipo, evento_id, slot_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.userId, tipo, evento_id || null, slot_id || null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Já inscrito' })
    res.status(500).json({ error: 'Erro ao realizar inscrição' })
  }
})

inscricoesRouter.delete('/:id', async (req, res) => {
  try {
    const isStaff = ['admin', 'instrutor'].includes(req.user.role)
    const query = isStaff
      ? 'DELETE FROM inscricoes WHERE id = $1'
      : 'DELETE FROM inscricoes WHERE id = $1 AND usuario_id = $2'
    const params = isStaff ? [req.params.id] : [req.params.id, req.user.userId]
    const { rowCount } = await pool.query(query, params)
    if (!rowCount) return res.status(404).json({ error: 'Inscrição não encontrada' })
    res.json({ success: true })
  } catch { res.status(500).json({ error: 'Erro ao cancelar inscrição' }) }
})

// ──────────────────────────────────────────────────────────────
// COMUNICADOS
// ──────────────────────────────────────────────────────────────
export const comunicadosRouter = Router()
comunicadosRouter.use(authMiddleware)

comunicadosRouter.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM comunicados ORDER BY data DESC')
    res.json(rows)
  } catch { res.status(500).json({ error: 'Erro ao buscar comunicados' }) }
})

comunicadosRouter.post('/', requireRole('admin', 'instrutor'), async (req, res) => {
  const { titulo, texto, data } = req.body
  try {
    const { rows } = await pool.query(
      `INSERT INTO comunicados (titulo, texto, data) VALUES ($1, $2, $3) RETURNING *`,
      [titulo, texto, data || new Date()]
    )
    res.status(201).json(rows[0])
  } catch { res.status(500).json({ error: 'Erro ao criar comunicado' }) }
})

comunicadosRouter.patch('/:id', requireRole('admin', 'instrutor'), async (req, res) => {
  const { titulo, texto, data } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE comunicados SET
        titulo = COALESCE($1, titulo), texto = COALESCE($2, texto),
        data = COALESCE($3, data), atualizado_em = NOW()
       WHERE id = $4 RETURNING *`,
      [titulo, texto, data, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Comunicado não encontrado' })
    res.json(rows[0])
  } catch { res.status(500).json({ error: 'Erro ao atualizar comunicado' }) }
})

comunicadosRouter.delete('/:id', requireRole('admin', 'instrutor'), async (req, res) => {
  try {
    await pool.query('DELETE FROM comunicados WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch { res.status(500).json({ error: 'Erro ao deletar comunicado' }) }
})

// ──────────────────────────────────────────────────────────────
// HISTÓRICO DE TREINOS
// ──────────────────────────────────────────────────────────────
export const historicoRouter = Router()
historicoRouter.use(authMiddleware)

historicoRouter.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT h.*, ft.titulo AS ficha_titulo
       FROM historico_treinos h
       LEFT JOIN fichas_treino ft ON ft.id = h.ficha_id
       WHERE h.usuario_id = $1 ORDER BY h.data_treino DESC`,
      [req.user.userId]
    )
    res.json(rows)
  } catch { res.status(500).json({ error: 'Erro ao buscar histórico' }) }
})

historicoRouter.post('/', async (req, res) => {
  const { ficha_id, data_treino, observacao } = req.body
  try {
    const { rows } = await pool.query(
      `INSERT INTO historico_treinos (usuario_id, ficha_id, data_treino, observacao)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.userId, ficha_id || null, data_treino || new Date(), observacao || null]
    )
    res.status(201).json(rows[0])
  } catch { res.status(500).json({ error: 'Erro ao registrar treino' }) }
})

// ──────────────────────────────────────────────────────────────
// PROGRESSO DE EXERCÍCIOS
// ──────────────────────────────────────────────────────────────
export const progressoRouter = Router()
progressoRouter.use(authMiddleware)

progressoRouter.get('/:fichaId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT pe.exercicio_id, pe.concluido, pe.data
       FROM progresso_exercicios pe
       JOIN exercicios ex ON ex.id = pe.exercicio_id
       WHERE pe.usuario_id = $1 AND ex.ficha_id = $2 AND pe.data = CURRENT_DATE`,
      [req.user.userId, req.params.fichaId]
    )
    const progresso = Object.fromEntries(rows.map(r => [r.exercicio_id, r.concluido]))
    res.json(progresso)
  } catch { res.status(500).json({ error: 'Erro ao buscar progresso' }) }
})

progressoRouter.post('/', async (req, res) => {
  const { exercicio_id, concluido } = req.body
  try {
    const { rows } = await pool.query(
      `INSERT INTO progresso_exercicios (usuario_id, exercicio_id, concluido, data)
       VALUES ($1, $2, $3, CURRENT_DATE)
       ON CONFLICT (usuario_id, exercicio_id, data)
       DO UPDATE SET concluido = EXCLUDED.concluido
       RETURNING *`,
      [req.user.userId, exercicio_id, concluido ?? true]
    )
    res.json(rows[0])
  } catch { res.status(500).json({ error: 'Erro ao salvar progresso' }) }
})
