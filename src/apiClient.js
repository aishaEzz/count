const BASE = (import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : ''

function url(path){
  // if BASE provided, call as absolute (e.g. https://api.example.com), else use relative /api
  if(BASE) return `${BASE}${path.startsWith('/') ? '' : '/'}${path}`
  return `/api${path}`
}

export async function apiGet(path){
  const res = await fetch(url(path))
  if(!res.ok) throw new Error('API error')
  return res.json()
}

export async function apiPost(path, body){
  const res = await fetch(url(path),{
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if(!res.ok) throw new Error('API error')
  return res.json()
}
