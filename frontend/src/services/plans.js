const PLANS_KEY = 'olympo:mock:planos'

function safeParse(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const seedPlans = [
  { id: 'p-1', nome: 'Mensal', tipo: 'mensal', valor: 119.9, descricao: 'Acesso completo por 30 dias.', status: 'ativo' },
  { id: 'p-2', nome: 'Anual', tipo: 'anual', valor: 1199.0, descricao: 'Acesso completo por 12 meses.', status: 'ativo' },
]

export function loadPlans() {
  const raw = localStorage.getItem(PLANS_KEY)
  const parsed = raw ? safeParse(raw) : null
  if (Array.isArray(parsed)) return parsed
  localStorage.setItem(PLANS_KEY, JSON.stringify(seedPlans))
  return [...seedPlans]
}

export function savePlans(plans) {
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans))
}

export function upsertPlan(plan) {
  const plans = loadPlans()
  const idx = plans.findIndex((p) => p.id === plan.id)
  if (idx >= 0) plans[idx] = plan
  else plans.unshift(plan)
  savePlans(plans)
  return plans
}

export function deletePlan(planId) {
  const plans = loadPlans().filter((p) => p.id !== planId)
  savePlans(plans)
  return plans
}

