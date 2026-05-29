const PREFIX = 'olympo:avatar:'

export function loadProfilePhoto(userKey) {
  if (!userKey) return null
  return localStorage.getItem(`${PREFIX}${userKey}`)
}

export function saveProfilePhoto(userKey, dataUrl) {
  if (!userKey) return
  localStorage.setItem(`${PREFIX}${userKey}`, dataUrl)
}

export function clearProfilePhoto(userKey) {
  if (!userKey) return
  localStorage.removeItem(`${PREFIX}${userKey}`)
}

export async function readImageFileAsDataUrl(file, maxBytes = 2 * 1024 * 1024) {
  if (!file?.type?.startsWith('image/')) {
    throw new Error('Selecione um arquivo de imagem válido.')
  }
  if (file.size > maxBytes) {
    throw new Error('A imagem deve ter no máximo 2 MB.')
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    reader.readAsDataURL(file)
  })
}
