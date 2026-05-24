<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div class="text-lg font-semibold">Olympo</div>

        <nav class="flex items-center gap-3 text-sm">
          <router-link class="rounded px-2 py-1 hover:bg-slate-100" to="/">Home</router-link>
          <router-link class="rounded px-2 py-1 hover:bg-slate-100" to="/login">Login</router-link>
          <router-link class="rounded px-2 py-1 hover:bg-slate-100" to="/dashboard">
            Dashboard
          </router-link>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-6">
      <router-view />
    </main>
  </div>
</template>
