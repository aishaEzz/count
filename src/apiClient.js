const BASE = (import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : ''

function url(path){
  // if BASE provided, call as absolute (e.g. https://api.example.com), else use relative /api
  if(BASE) return `${BASE}${path.startsWith('/') ? '' : '/'}${path}`
  return `/api${path}`
}

const BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : ''

const fallbackData = {
  alerts: [
    { type: 'مخزون', text: 'مخزون فحم البرتقال أقل من الحد الأدنى' },
    { type: 'ديون', text: 'العميل شركة الخليج تجاوز الحد الائتماني' },
    { type: 'تحصيل', text: 'يوجد شيكات مستحقة خلال 3 أيام' }
  ],
  products: [
    { name: 'فحم برتقال', stock: 12, min: 20, cost: 8500 },
    { name: 'فحم ليمون', stock: 35, min: 15, cost: 9100 },
    { name: 'فحم جزورين', stock: 8, min: 10, cost: 7800 }
  ],
  customers: [
    { name: 'شركة الخليج', employee: 'أحمد', balance: 220000, limit: 150000 },
    { name: 'شركة النور', employee: 'محمد', balance: 90000, limit: 180000 }
  ],
  sales: [
    { invoice: 'SAL-001', customer: 'شركة الخليج', product: 'فحم برتقال', qty: 5, total: 65000, employee: 'أحمد' },
    { invoice: 'SAL-002', customer: 'شركة النور', product: 'فحم ليمون', qty: 3, total: 39000, employee: 'محمد' }
  ],
  expenses: [
    { type: 'نقل وشحن', value: 15000 },
    { type: 'وقود', value: 4000 },
    { type: 'رواتب', value: 35000 }
  ]
}

function buildUrl(path){
  if(BASE) return `${BASE}${path.startsWith('/') ? '' : '/'}${path}`
  return `/api${path}`
}

function getFallbackData(path){
  const key = path.replace(/^\//, '')
  if(key in fallbackData) return fallbackData[key]
  throw new Error('Unknown fallback path: ' + path)
}

export async function apiGet(path){
  if(!BASE){
    try {
      const res = await fetch(`/api${path}`)
      if(res.ok) return res.json()
      return getFallbackData(path)
    } catch {
      return getFallbackData(path)
    }
  }

  try {
    const res = await fetch(buildUrl(path))
    if(!res.ok) throw new Error('API error')
    return res.json()
  } catch {
    return getFallbackData(path)
  }
}

export async function apiPost(path, body){
  if(!BASE){
    switch(path){
      case '/sales': {
        const next = 'SAL-' + String(fallbackData.sales.length + 1).padStart(3, '0')
        const created = { invoice: next, ...body }
        fallbackData.sales.unshift(created)
        const prod = fallbackData.products.find(p => p.name === body.product)
        if(prod) prod.stock = Math.max(0, prod.stock - Number(body.qty || 0))
        return created
      }
      case '/products': {
        fallbackData.products.push(body)
        return body
      }
      case '/customers': {
        fallbackData.customers.push(body)
        return body
      }
      default:
        throw new Error('Unknown fallback post path: ' + path)
    }
  }

  try {
    const res = await fetch(buildUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if(!res.ok) throw new Error('API error')
    return res.json()
  } catch {
    return apiPost(path, body)
  }
}
