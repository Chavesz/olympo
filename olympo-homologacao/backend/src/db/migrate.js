import 'dotenv/config'
import pool from './pool.js'

const sql = `
-- ============================================================
--  OLYMPO ACADEMIA — Migração do banco de dados
-- ============================================================

-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────────────────────
-- USUÁRIOS (autenticação e perfil base)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT        NOT NULL,
  email       TEXT        NOT NULL UNIQUE,
  senha_hash  TEXT        NOT NULL,
  role        TEXT        NOT NULL CHECK (role IN ('admin', 'instrutor', 'aluno')),
  status      TEXT        NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- INSTRUTORES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS instrutores (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id    UUID        NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  cref          TEXT,
  especialidade TEXT,
  status        TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- PLANOS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planos (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome      TEXT           NOT NULL,
  tipo      TEXT           NOT NULL CHECK (tipo IN ('mensal', 'trimestral', 'semestral', 'anual')),
  valor     NUMERIC(10,2)  NOT NULL,
  descricao TEXT,
  status    TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- ALUNOS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alunos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id       UUID        NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  telefone         TEXT,
  data_nascimento  DATE,
  data_matricula   DATE        NOT NULL DEFAULT CURRENT_DATE,
  plano_id         UUID        REFERENCES planos(id) ON DELETE SET NULL,
  status           TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- FICHAS DE TREINO
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fichas_treino (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo        TEXT NOT NULL,
  aluno_id      UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  instrutor_id  UUID NOT NULL REFERENCES instrutores(id) ON DELETE RESTRICT,
  objetivo      TEXT,
  status        TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa')),
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- EXERCÍCIOS DE UMA FICHA
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exercicios (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ficha_id  UUID NOT NULL REFERENCES fichas_treino(id) ON DELETE CASCADE,
  nome      TEXT NOT NULL,
  series    INTEGER,
  repeticoes TEXT,  -- ex: "8-10", "12", "até a falha"
  ordem     INTEGER NOT NULL DEFAULT 0,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- HISTÓRICO DE TREINOS (log de execução)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS historico_treinos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  ficha_id    UUID REFERENCES fichas_treino(id) ON DELETE SET NULL,
  data_treino TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  observacao  TEXT,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- AVALIAÇÕES FÍSICAS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS avaliacoes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id    UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  instrutor_id UUID REFERENCES instrutores(id) ON DELETE SET NULL,
  peso        NUMERIC(5,2),
  altura      NUMERIC(5,2),
  imc         NUMERIC(5,2) GENERATED ALWAYS AS (
                CASE WHEN altura > 0 THEN ROUND((peso / (altura * altura))::NUMERIC, 2) ELSE NULL END
              ) STORED,
  gordura_pct NUMERIC(5,2),
  observacao  TEXT,
  data_avaliacao DATE NOT NULL DEFAULT CURRENT_DATE,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- EVENTOS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS eventos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  data        DATE NOT NULL,
  horario     TIME NOT NULL,
  local       TEXT,
  descricao   TEXT,
  vagas       INTEGER NOT NULL DEFAULT 0,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- AULAS COLETIVAS (modalidades + slots de horário)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS modalidades (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome      TEXT NOT NULL UNIQUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aulas_slots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modalidade_id UUID NOT NULL REFERENCES modalidades(id) ON DELETE CASCADE,
  dia_semana   TEXT NOT NULL CHECK (dia_semana IN ('Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo')),
  horario      TIME NOT NULL,
  vagas        INTEGER NOT NULL DEFAULT 20,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- INSCRIÇÕES (eventos e aulas)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inscricoes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo       TEXT NOT NULL CHECK (tipo IN ('evento', 'aula')),
  evento_id  UUID REFERENCES eventos(id) ON DELETE CASCADE,
  slot_id    UUID REFERENCES aulas_slots(id) ON DELETE CASCADE,
  data_inscricao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, evento_id),
  UNIQUE (usuario_id, slot_id)
);

-- ──────────────────────────────────────────────────────────────
-- COMUNICADOS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comunicados (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo    TEXT NOT NULL,
  texto     TEXT NOT NULL,
  data      DATE NOT NULL DEFAULT CURRENT_DATE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- PROGRESSO DE EXERCÍCIOS (checklist por sessão)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progresso_exercicios (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id   UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  exercicio_id UUID NOT NULL REFERENCES exercicios(id) ON DELETE CASCADE,
  concluido    BOOLEAN NOT NULL DEFAULT FALSE,
  data         DATE NOT NULL DEFAULT CURRENT_DATE,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, exercicio_id, data)
);

-- ──────────────────────────────────────────────────────────────
-- ÍNDICES para performance
-- ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_alunos_usuario_id        ON alunos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_instrutores_usuario_id   ON instrutores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_fichas_aluno_id          ON fichas_treino(aluno_id);
CREATE INDEX IF NOT EXISTS idx_fichas_instrutor_id      ON fichas_treino(instrutor_id);
CREATE INDEX IF NOT EXISTS idx_exercicios_ficha_id      ON exercicios(ficha_id);
CREATE INDEX IF NOT EXISTS idx_historico_usuario_id     ON historico_treinos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_aluno_id      ON avaliacoes(aluno_id);
CREATE INDEX IF NOT EXISTS idx_inscricoes_usuario_id    ON inscricoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_slots_modalidade_id      ON aulas_slots(modalidade_id);
CREATE INDEX IF NOT EXISTS idx_progresso_usuario_ex     ON progresso_exercicios(usuario_id, exercicio_id);

-- ──────────────────────────────────────────────────────────────
-- UNIDADES E EQUIPAMENTOS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS unidades (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         TEXT NOT NULL,
  endereco     TEXT,
  telefone     TEXT,
  horario      TEXT,
  imagem_key   TEXT,
  plano_mensal TEXT,
  plano_anual  TEXT,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipamentos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  categoria   TEXT,
  quantidade  INTEGER NOT NULL DEFAULT 1,
  status      TEXT NOT NULL DEFAULT 'disponivel',
  unidade_id  UUID REFERENCES unidades(id) ON DELETE SET NULL,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`

async function migrate() {
  const client = await pool.connect()
  try {
    console.log('⏳ Rodando migrações...')
    await client.query(sql)
    console.log('✅ Migrações aplicadas com sucesso!')
  } catch (err) {
    console.error('❌ Erro na migração:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
