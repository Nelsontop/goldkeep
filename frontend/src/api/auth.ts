export async function loginApi(password: string) {
  const form = new FormData()
  form.append('password', password)
  const res = await fetch('/api/login', { method: 'POST', body: form })
  if (!res.ok) throw new Error((await res.json()).detail || res.statusText)
  const data = await res.json()
  return data.token
}

export async function changePasswordApi(newPassword: string) {
  const form = new FormData()
  form.append('new_password', newPassword)
  const res = await fetch('/api/password', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    body: form,
  })
  if (!res.ok) throw new Error((await res.json()).detail || res.statusText)
}
