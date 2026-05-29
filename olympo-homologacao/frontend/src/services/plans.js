import { createPlano, deletePlano, fetchPlanos, updatePlano } from './portalData'

export async function loadPlans() {
  return fetchPlanos()
}

export async function upsertPlan(plan) {
  const isUuid = plan.id && String(plan.id).includes('-') && plan.id.length > 20
  if (isUuid) {
    await updatePlano(plan.id, plan)
  } else {
    await createPlano(plan)
  }
  return loadPlans()
}

export async function deletePlan(planId) {
  await deletePlano(planId)
  return loadPlans()
}
