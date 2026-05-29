<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p class="text-sm text-slate-700">
        Área inicial após login. Aqui entram atalhos, visão geral e relatórios (admin).
      </p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div class="rounded-lg border border-slate-200 bg-white p-4">
        <div class="text-sm font-semibold text-slate-900">Alunos</div>
        <div class="mt-1 text-sm text-slate-700">CRUD de alunos.</div>
      </div>

      <div class="rounded-lg border border-slate-200 bg-white p-4">
        <div class="text-sm font-semibold text-slate-900">Instrutores</div>
        <div class="mt-1 text-sm text-slate-700">CRUD de instrutores.</div>
      </div>

      <div class="rounded-lg border border-slate-200 bg-white p-4">
        <div class="text-sm font-semibold text-slate-900">Fichas de Treino</div>
        <div class="mt-1 text-sm text-slate-700">CRUD de fichas.</div>
      </div>
    </div>

    <div class="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
      <div class="font-semibold text-slate-900">Dica</div>
      <div>Para abrir a área Admin, faça login com e-mail contendo “admin”.</div>
    </div>
  </section>
</template>
