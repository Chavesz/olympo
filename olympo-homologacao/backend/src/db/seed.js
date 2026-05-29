import 'dotenv/config'
import bcrypt from 'bcryptjs'
import pool from './pool.js'

async function seed() {
  const client = await pool.connect()
  try {
    console.log('⏳ Populando banco com dados iniciais...')
    await client.query('BEGIN')

    // ── Usuários ──────────────────────────────────────────────
    const senhaHash = await bcrypt.hash('123456', 10)

    const { rows: usuarios } = await client.query(`
      INSERT INTO usuarios (nome, email, senha_hash, role, status) VALUES
        ('Admin Olympo',   'admin@olympo.dev',   $1, 'admin',    'ativo'),
        ('Felipe Silva',   'felipe@olympo.dev',  $1, 'instrutor','ativo'),
        ('Ana Souza',      'ana@olympo.dev',      $1, 'instrutor','ativo'),
        ('Jonh Santos',    'jonh@olympo.dev',     $1, 'aluno',   'ativo'),
        ('Kauã Chaves',    'kaua@olympo.dev',     $1, 'aluno',   'inativo'),
        ('Maria Oliveira', 'maria@olympo.dev',    $1, 'aluno',   'ativo')
      ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome
      RETURNING id, email, role
    `, [senhaHash])

    const byEmail = Object.fromEntries(usuarios.map(u => [u.email, u]))
    console.log(`  → ${usuarios.length} usuários criados`)

    // ── Planos — delete+insert idempotente (sem UNIQUE constraint em nome) ──
    await client.query(`
      INSERT INTO planos (nome, tipo, valor, descricao, status)
      SELECT nome, tipo, valor::numeric, descricao, status FROM (VALUES
        ('Mensal',     'mensal',      '119.90', 'Acesso completo por 30 dias.',   'ativo'),
        ('Trimestral', 'trimestral',  '299.90', 'Acesso completo por 3 meses.',  'ativo'),
        ('Semestral',  'semestral',   '549.90', 'Acesso completo por 6 meses.',  'ativo'),
        ('Anual',      'anual',      '1199.00', 'Acesso completo por 12 meses.', 'ativo')
      ) AS v(nome, tipo, valor, descricao, status)
      WHERE NOT EXISTS (SELECT 1 FROM planos p WHERE p.nome = v.nome)
    `)
    const { rows: todosPlanos } = await client.query('SELECT id, nome FROM planos')
    const planoMensal = todosPlanos.find(p => p.nome === 'Mensal')
    const planoAnual  = todosPlanos.find(p => p.nome === 'Anual')
    console.log(`  → planos verificados (${todosPlanos.length} total)`)

    // ── Instrutores ───────────────────────────────────────────
    const { rows: instrutores } = await client.query(`
      INSERT INTO instrutores (usuario_id, cref, especialidade, status) VALUES
        ($1, 'CREF 123456-G/SP', 'Hipertrofia',   'ativo'),
        ($2, 'CREF 654321-G/SP', 'Emagrecimento', 'ativo')
      ON CONFLICT (usuario_id) DO UPDATE SET
        cref = EXCLUDED.cref,
        especialidade = EXCLUDED.especialidade
      RETURNING id, usuario_id
    `, [
      byEmail['felipe@olympo.dev'].id,
      byEmail['ana@olympo.dev'].id,
    ])
    const instFelipe = instrutores[0]
    const instAna    = instrutores[1]
    console.log(`  → ${instrutores.length} instrutores criados`)

    // ── Alunos ────────────────────────────────────────────────
    const { rows: alunos } = await client.query(`
      INSERT INTO alunos (usuario_id, telefone, data_nascimento, data_matricula, plano_id, status) VALUES
        ($1, '(11) 90000-0001', '2001-04-12', '2025-02-03', $4, 'ativo'),
        ($2, '(11) 90000-0002', '2002-09-20', '2024-10-15', $5, 'inativo'),
        ($3, '(11) 90000-0003', '1999-12-05', '2025-06-01', $4, 'ativo')
      ON CONFLICT (usuario_id) DO UPDATE SET
        telefone = EXCLUDED.telefone,
        plano_id = EXCLUDED.plano_id
      RETURNING id, usuario_id
    `, [
      byEmail['jonh@olympo.dev'].id,
      byEmail['kaua@olympo.dev'].id,
      byEmail['maria@olympo.dev'].id,
      planoMensal?.id,
      planoAnual?.id,
    ])
    const alunoJonh  = alunos[0]
    const alunoMaria = alunos[2]
    console.log(`  → ${alunos.length} alunos criados`)

    // ── Fichas de Treino ──────────────────────────────────────
    if (instFelipe && alunoJonh) {
      const { rows: fichas } = await client.query(`
        INSERT INTO fichas_treino (titulo, aluno_id, instrutor_id, objetivo, status) VALUES
          ('Treino A - Superior', $1, $2, 'Hipertrofia',    'ativa'),
          ('Treino B - Inferior', $3, $4, 'Condicionamento','ativa')
        ON CONFLICT DO NOTHING
        RETURNING id, titulo
      `, [alunoJonh.id, instFelipe.id, alunoMaria?.id, instAna?.id])

      if (fichas.length > 0) {
        await client.query(`
          INSERT INTO exercicios (ficha_id, nome, series, repeticoes, ordem) VALUES
            ($1, 'Supino reto',        4, '8-10',  1),
            ($1, 'Puxada na barra',    4, '10-12', 2),
            ($1, 'Desenvolvimento',    3, '8-10',  3),
            ($1, 'Rosca direta',       3, '10-12', 4),
            ($1, 'Tríceps corda',      3, '12-15', 5)
          ON CONFLICT DO NOTHING
        `, [fichas[0].id])

        if (fichas[1]) {
          await client.query(`
            INSERT INTO exercicios (ficha_id, nome, series, repeticoes, ordem) VALUES
              ($1, 'Agachamento',       4, '8-10',  1),
              ($1, 'Leg press',         4, '10-12', 2),
              ($1, 'Cadeira extensora', 3, '12-15', 3)
            ON CONFLICT DO NOTHING
          `, [fichas[1].id])
        }
      }
      console.log(`  → ${fichas.length} fichas + exercícios criados`)
    }

    // ── Eventos — delete+insert idempotente ───────────────────
    await client.query(`
      DELETE FROM eventos
      WHERE nome IN ('Desafio 30 dias', 'Aulão aberto', 'Semana da saúde')
        AND data IN ('2026-06-10', '2026-06-22', '2026-07-01')
    `)
    await client.query(`
      INSERT INTO eventos (nome, data, horario, local, descricao, vagas) VALUES
        ('Desafio 30 dias', '2026-06-10', '19:00', 'Unidade Centro', 'Treinos guiados e metas semanais.', 30),
        ('Aulão aberto',    '2026-06-22', '10:00', 'Unidade Norte',  'Funcional e HIIT para todos.', 40),
        ('Semana da saúde', '2026-07-01', '18:00', 'Unidade Centro', 'Palestras, avaliações e nutrição.', 60)
    `)
    console.log('  → 3 eventos criados (seed idempotente)')

    // ── Modalidades e Slots de Aulas ──────────────────────────
    const { rows: modalidades } = await client.query(`
      INSERT INTO modalidades (nome) VALUES
        ('Pilates'), ('Funcional'), ('Spinning')
      ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome
      RETURNING id, nome
    `)

    for (const mod of modalidades) {
      const slots = {
        Pilates:   [['Segunda','07:00',10],['Quarta','19:00',10]],
        Funcional: [['Terça','18:00',20],['Quinta','06:30',20]],
        Spinning:  [['Segunda','20:00',18],['Sexta','07:00',18]],
      }[mod.nome] || []
      for (const [dia, hora, vagas] of slots) {
        await client.query(`
          INSERT INTO aulas_slots (modalidade_id, dia_semana, horario, vagas)
          VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING
        `, [mod.id, dia, hora, vagas])
      }
    }
    console.log(`  → ${modalidades.length} modalidades + slots verificados`)

    // ── Unidades ──────────────────────────────────────────────
    await client.query(`
      INSERT INTO unidades (nome, endereco, telefone, horario, imagem_key, plano_mensal, plano_anual) VALUES
        ('Olympo Centro', 'Av. Central, 1500',      '(83) 99999-9999', '05h às 23h', 'centro', 'R$ 119,90', 'R$ 999,90'),
        ('Olympo Norte',  'Rua Arena Brasil, 220',  '(83) 98888-8888', '24 horas',   'norte',  'R$ 139,90', 'R$ 1199,90')
      ON CONFLICT DO NOTHING
    `)
    const { rows: unidades } = await client.query('SELECT id, imagem_key FROM unidades')
    const unCentro = unidades.find((u) => u.imagem_key === 'centro')
    if (unCentro) {
      await client.query(`
        INSERT INTO equipamentos (nome, categoria, quantidade, status, unidade_id) VALUES
          ('Esteira profissional', 'Cardio',     12, 'disponivel', $1),
          ('Leg press 45°',        'Musculação',  4, 'manutencao', $1)
        ON CONFLICT DO NOTHING
      `, [unCentro.id])
    }
    console.log(`  → ${unidades.length} unidades verificadas`)

    // ── Comunicados — delete+insert idempotente ───────────────
    await client.query(`
      DELETE FROM comunicados
      WHERE titulo IN (
        'Horário especial no feriado',
        'Manutenção preventiva',
        'Nova turma de funcional'
      ) AND data IN ('2026-05-18', '2026-05-10', '2026-05-02')
    `)
    await client.query(`
      INSERT INTO comunicados (titulo, texto, data) VALUES
        ('Horário especial no feriado', 'No feriado, a unidade Centro funcionará das 08:00 às 14:00.', '2026-05-18'),
        ('Manutenção preventiva',       'Alguns equipamentos passarão por manutenção preventiva.',      '2026-05-10'),
        ('Nova turma de funcional',     'Abrimos uma nova turma de funcional às quintas, 06:30.',       '2026-05-02')
    `)
    console.log('  → 3 comunicados criados (seed idempotente)')

    await client.query('COMMIT')
    console.log('\n✅ Seed concluído com sucesso!')
    console.log('\n📋 Credenciais de acesso (senha: 123456):')
    console.log('   admin@olympo.dev   → admin')
    console.log('   felipe@olympo.dev  → instrutor')
    console.log('   jonh@olympo.dev    → aluno')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Erro no seed:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
