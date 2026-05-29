import { onMounted, ref } from 'vue'
import { fetchAlunoMe } from '../services/data'

export function useAlunoProfile() {
  const aluno = ref(null)
  const loading = ref(true)
  const error = ref('')

  async function refresh() {
    loading.value = true
    error.value = ''
    try {
      aluno.value = await fetchAlunoMe()
    } catch (e) {
      error.value = e.message || 'Erro ao carregar perfil'
      aluno.value = null
    } finally {
      loading.value = false
    }
  }

  onMounted(refresh)

  return { aluno, loading, error, refresh }
}
