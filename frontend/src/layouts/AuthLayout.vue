<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <router-link class="text-lg font-semibold" to="/">Olympo</router-link>
        <div class="flex items-center gap-2">
          <router-link class="rounded px-2 py-1 text-sm hover:bg-slate-100" to="/cadastro">
            Cadastro
          </router-link>
          <router-link class="rounded px-2 py-1 text-sm hover:bg-slate-100" to="/login">
            Login
          </router-link>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-6">
      <router-view />
    </main>
  </div>
</template>
