<template>
  <section class="space-y-10">
    <header class="space-y-4">
      <div class="flex items-center gap-3">
        <div
          class="grid h-11 w-11 place-items-center rounded-xl bg-slate-900 text-sm font-extrabold text-white"
        >
          O
        </div>
        <div>
          <div class="text-sm font-semibold text-slate-600">Olympo</div>
          <div class="text-xs text-slate-500">Gestão de Academias</div>
        </div>
      </div>

      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
        Sistema de gestão com perfis e segurança
      </h1>

      <p class="max-w-prose text-slate-700">
        Base do front-end com Vue 3, Tailwind e Router Guard. Próximo passo: integrar autenticação JWT no
        back-end.
      </p>
    </header>

    <div class="flex flex-wrap gap-3">
      <router-link
        class="inline-flex items-center rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        to="/login"
      >
        Acessar
      </router-link>

      <router-link
        class="inline-flex items-center rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        to="/dashboard"
      >
        Ir para Dashboard
      </router-link>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div class="rounded-lg border border-slate-200 bg-white p-4">
        <div class="text-sm font-semibold text-slate-900">Perfis de acesso</div>
        <div class="mt-1 text-sm text-slate-700">Admin vs Usuário comum (escopo limitado).</div>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4">
        <div class="text-sm font-semibold text-slate-900">Router Guard</div>
        <div class="mt-1 text-sm text-slate-700">Bloqueia rotas protegidas sem login.</div>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4">
        <div class="text-sm font-semibold text-slate-900">Base de telas</div>
        <div class="mt-1 text-sm text-slate-700">Home, Login, Dashboard e Admin.</div>
      </div>
    </div>
  </section>
</template>
