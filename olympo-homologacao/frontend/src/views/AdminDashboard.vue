<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Painel Administrativo</h1>
      <p class="text-sm text-slate-300">
        Área restrita para administrador. Aqui entram relatórios e configurações globais.
      </p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div class="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div class="text-sm font-semibold text-slate-50">Relatórios</div>
        <div class="mt-1 text-sm text-slate-300">Métricas, faturamento e comparativos.</div>
      </div>

      <div class="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div class="text-sm font-semibold text-slate-50">Gestão</div>
        <div class="mt-1 text-sm text-slate-300">Perfis, permissões e auditoria.</div>
      </div>

      <div class="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div class="text-sm font-semibold text-slate-50">Configurações</div>
        <div class="mt-1 text-sm text-slate-300">Unidades, planos e integrações.</div>
      </div>
    </div>
  </section>
</template>
