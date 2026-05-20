import React, { useEffect, useState } from 'react'
import { apiGet, apiPost } from '../apiClient'

export default function CoalERPSystem(){
  const [alerts, setAlerts] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [sales, setSales] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [newSale, setNewSale] = useState({ customer: '', product: '', qty: 1 })
  const [newProduct, setNewProduct] = useState({ name: '', stock: 0, min: 0, cost: 0 })
  const [newCustomer, setNewCustomer] = useState({ name: '', employee: '', balance: 0, limit: 0 })
  const [activeSection, setActiveSection] = useState('dashboard')

  const purchaseSuggestions = products.filter(p => p.stock <= p.min)
  const salesByProduct = sales.reduce((acc, sale) => {
    acc[sale.product] = (acc[sale.product] || 0) + (sale.qty || 0)
    return acc
  }, {})
  const topProducts = Object.entries(salesByProduct)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,3)
  const revenueByCustomer = customers.map(customer => ({
    name: customer.name,
    revenue: sales.filter(s => s.customer === customer.name).reduce((sum, sale) => sum + (sale.total || 0), 0)
  })).sort((a,b)=>b.revenue-a.revenue)

  const [message, setMessage] = useState(null)

  useEffect(()=>{
    setLoading(true)
    setError(null)
    Promise.all([
      apiGet('/alerts').catch(()=>[]),
      apiGet('/products').catch(()=>[]),
      apiGet('/customers').catch(()=>[]),
      apiGet('/sales').catch(()=>[]),
      apiGet('/expenses').catch(()=>[])
    ]).then(([a,p,c,s,e])=>{
      setAlerts(a || [])
      setProducts(p || [])
      setCustomers(c || [])
      setSales(s || [])
      setExpenses(e || [])
      setLoading(false)
    }).catch(err=>{
      console.error(err)
      setError('فشل تحميل البيانات - تحقق من الخادم')
      setLoading(false)
    })
  },[])

  const totalSales = sales.reduce((a,b)=>a + (b.total || 0), 0)
  const totalExpenses = expenses.reduce((a,b)=>a + (b.value || 0), 0)
  const netProfit = totalSales - totalExpenses

  function flash(msg){
    setMessage(msg)
    setTimeout(()=>setMessage(null), 3000)
  }

  async function handleAddSale(e){
    e.preventDefault()
    const product = products.find(p=>p.name === newSale.product)
    if(!product){ flash('اختر صنفاً صحيحاً'); return }
    if(!newSale.customer){ flash('اختر العميل'); return }
    const total = (product.cost || 0) * Number(newSale.qty || 0)
    const payload = { ...newSale, qty: Number(newSale.qty), total }
    try{
      const created = await apiPost('/sales', payload)
      setSales(prev => [created, ...prev])
      setProducts(prev => prev.map(p => p.name === created.product ? { ...p, stock: Math.max(0, p.stock - created.qty) } : p))
      setNewSale({ customer: '', product: '', qty: 1 })
      flash('تمت إضافة الفاتورة')
    }catch(err){ console.error(err); flash('فشل إضافة الفاتورة') }
  }

  async function handleAddProduct(e){
    e.preventDefault()
    if(!newProduct.name) return flash('أدخل اسم الصنف')
    if(newProduct.stock < 0 || newProduct.min < 0 || newProduct.cost < 0) return flash('قيم رقمية غير صحيحة')
    try{
      const created = await apiPost('/products', { ...newProduct, stock: Number(newProduct.stock), min: Number(newProduct.min), cost: Number(newProduct.cost) })
      setProducts(prev => [...prev, created])
      setNewProduct({ name: '', stock: 0, min: 0, cost: 0 })
      flash('تمت إضافة الصنف')
    }catch(err){ console.error(err); flash('فشل إضافة الصنف') }
  }

  async function handleAddCustomer(e){
    e.preventDefault()
    if(!newCustomer.name) return flash('أدخل اسم العميل')
    if(newCustomer.balance < 0 || newCustomer.limit < 0) return flash('قيم رقمية غير صحيحة')
    try{
      const created = await apiPost('/customers', { ...newCustomer, balance: Number(newCustomer.balance), limit: Number(newCustomer.limit) })
      setCustomers(prev => [...prev, created])
      setNewCustomer({ name: '', employee: '', balance: 0, limit: 0 })
      flash('تمت إضافة العميل')
    }catch(err){ console.error(err); flash('فشل إضافة العميل') }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">⏳ جاري التحميل...</h1>
          <p className="text-slate-600">يرجى الانتظار بينما يتم تحميل البيانات</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 p-6 flex items-center justify-center" dir="rtl">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-3">❌ خطأ</h1>
          <p className="text-slate-600 mb-4">{error}</p>
          <p className="text-sm text-slate-500">تأكد من أن الخادم يعمل على المنفذ 4000</p>
          <button onClick={()=>{setLoading(true); setError(null); window.location.reload()}} className="mt-4 bg-black text-white px-4 py-2 rounded">إعادة محاولة</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="bg-black text-white rounded-3xl p-6 shadow-2xl">
          <h1 className="text-4xl font-bold mb-3">🔥 نظام إدارة شركة الفحم الخشبي</h1>
          <p className="text-slate-300 text-lg">نظام ERP متكامل لإدارة المبيعات والمخزون والمحاسبة والتصدير والتحصيلات</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow">
            <h2 className="text-lg font-bold mb-2">إجمالي المبيعات</h2>
            <p className="text-3xl font-bold">{totalSales.toLocaleString()} ج</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow">
            <h2 className="text-lg font-bold mb-2">إجمالي المصروفات</h2>
            <p className="text-3xl font-bold">{totalExpenses.toLocaleString()} ج</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow">
            <h2 className="text-lg font-bold mb-2">صافي الربح</h2>
            <p className="text-3xl font-bold">{netProfit.toLocaleString()} ج</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow">
            <h2 className="text-lg font-bold mb-2">عدد العملاء</h2>
            <p className="text-3xl font-bold">{customers.length}</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow">
          <h2 className="text-2xl font-bold mb-4">🚨 التنبيهات الذكية</h2>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border border-red-100 flex justify-between">
                <span className="font-bold">{alert.type}</span>
                <span>{alert.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-5">📦 إدارة المخزون</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-right">الصنف</th>
                    <th className="p-3">الرصيد</th>
                    <th className="p-3">الحد الأدنى</th>
                    <th className="p-3">متوسط التكلفة</th>
                    <th className="p-3">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-bold">{item.name}</td>
                      <td className="p-3 text-center">{item.stock}</td>
                      <td className="p-3 text-center">{item.min}</td>
                      <td className="p-3 text-center">{item.cost.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        {item.stock < item.min ? (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs">منخفض</span>
                        ) : (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">جيد</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form onSubmit={handleAddProduct} className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-2">
              <input className="p-2 border rounded" placeholder="اسم الصنف" value={newProduct.name} onChange={e=>setNewProduct(s=>({...s, name: e.target.value}))} />
              <input className="p-2 border rounded" type="number" min={0} placeholder="الرصيد" value={newProduct.stock} onChange={e=>setNewProduct(s=>({...s, stock: e.target.value}))} />
              <input className="p-2 border rounded" type="number" min={0} placeholder="الحد الأدنى" value={newProduct.min} onChange={e=>setNewProduct(s=>({...s, min: e.target.value}))} />
              <input className="p-2 border rounded" type="number" min={0} placeholder="التكلفة" value={newProduct.cost} onChange={e=>setNewProduct(s=>({...s, cost: e.target.value}))} />
              <div className="md:col-span-4">
                <button className="bg-black text-white px-4 py-2 rounded mt-2">إضافة صنف</button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-5">👥 العملاء والديون</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-right">العميل</th>
                    <th className="p-3">الموظف</th>
                    <th className="p-3">الرصيد</th>
                    <th className="p-3">الحد الائتماني</th>
                    <th className="p-3">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => (
                    <tr key={index} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-bold">{customer.name}</td>
                      <td className="p-3 text-center">{customer.employee}</td>
                      <td className="p-3 text-center">{customer.balance.toLocaleString()}</td>
                      <td className="p-3 text-center">{customer.limit.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        {customer.balance > customer.limit ? (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs">تجاوز الحد</span>
                        ) : (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">منتظم</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form onSubmit={handleAddCustomer} className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-2">
              <input className="p-2 border rounded" placeholder="اسم العميل" value={newCustomer.name} onChange={e=>setNewCustomer(s=>({...s, name: e.target.value}))} />
              <input className="p-2 border rounded" placeholder="الموظف" value={newCustomer.employee} onChange={e=>setNewCustomer(s=>({...s, employee: e.target.value}))} />
              <input className="p-2 border rounded" type="number" min={0} placeholder="الرصيد" value={newCustomer.balance} onChange={e=>setNewCustomer(s=>({...s, balance: e.target.value}))} />
              <input className="p-2 border rounded" type="number" min={0} placeholder="الحد الائتماني" value={newCustomer.limit} onChange={e=>setNewCustomer(s=>({...s, limit: e.target.value}))} />
              <div className="md:col-span-4">
                <button className="bg-black text-white px-4 py-2 rounded mt-2">إضافة عميل</button>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold">💰 آخر المبيعات</h2>
          </div>

          <form onSubmit={handleAddSale} className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <select className="p-3 border rounded" value={newSale.customer} onChange={e=>setNewSale(s=>({...s, customer: e.target.value}))} required>
              <option value="">اختر العميل</option>
              {customers.map(c=> <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>

            <select className="p-3 border rounded" value={newSale.product} onChange={e=>setNewSale(s=>({...s, product: e.target.value}))} required>
              <option value="">اختر الصنف</option>
              {products.map(p=> <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>

            <input className="p-3 border rounded" type="number" min={1} value={newSale.qty} onChange={e=>setNewSale(s=>({...s, qty: e.target.value}))} />

            <button className="bg-black text-white px-5 py-2 rounded-xl hover:opacity-90">إضافة فاتورة</button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-3">رقم الفاتورة</th>
                  <th className="p-3">العميل</th>
                  <th className="p-3">الصنف</th>
                  <th className="p-3">الكمية</th>
                  <th className="p-3">الإجمالي</th>
                  <th className="p-3">الموظف</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, index) => (
                  <tr key={index} className="border-b hover:bg-slate-50">
                    <td className="p-3 text-center">{sale.invoice}</td>
                    <td className="p-3 text-center">{sale.customer}</td>
                    <td className="p-3 text-center">{sale.product}</td>
                    <td className="p-3 text-center">{sale.qty}</td>
                    <td className="p-3 text-center">{(sale.total || 0).toLocaleString()}</td>
                    <td className="p-3 text-center">{sale.employee || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={()=>setActiveSection('purchases')}
            className={`rounded-2xl p-5 shadow transition text-xl font-bold ${activeSection === 'purchases' ? 'bg-black text-white' : 'bg-white hover:shadow-xl'}`}>
            📄 إدارة المشتريات
          </button>
          <button
            onClick={()=>setActiveSection('exports')}
            className={`rounded-2xl p-5 shadow transition text-xl font-bold ${activeSection === 'exports' ? 'bg-black text-white' : 'bg-white hover:shadow-xl'}`}>
            🚢 إدارة التصدير
          </button>
          <button
            onClick={()=>setActiveSection('reports')}
            className={`rounded-2xl p-5 shadow transition text-xl font-bold ${activeSection === 'reports' ? 'bg-black text-white' : 'bg-white hover:shadow-xl'}`}>
            📊 التقارير والتحليلات
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg mt-6">
          {activeSection === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">🏠 لوحة التحكم الرئيسية</h2>
              <p className="text-slate-600">اضغط على أي قسم أعلاه لعرض أدوات إدارة المشتريات أو التصدير أو التقارير.</p>
            </div>
          )}

          {activeSection === 'purchases' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">📄 إدارة المشتريات</h2>
              <p className="text-slate-600 mb-5">أدوات متابعة طلبات الشراء وإعادة التوريد.</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl">
                  <h3 className="font-bold mb-3">احتياجات إعادة التوريد</h3>
                  {purchaseSuggestions.length ? purchaseSuggestions.map((item, index) => (
                    <div key={index} className="border-b last:border-b-0 py-3">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-slate-600">الرصيد: {item.stock} - الحد الأدنى: {item.min}</p>
                    </div>
                  )) : <p className="text-slate-600">لا توجد أصناف بحاجة إلى إعادة توريد الآن.</p>}
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl">
                  <h3 className="font-bold mb-3">أحدث طلبات شراء</h3>
                  <p className="text-slate-600">يمكنك إنشاء طلبات شراء هنا لزيادة رصيد الأصناف.</p>
                  <p className="text-sm text-slate-500">النظام يدعم حالياً متابعة الأصناف الأقل من الحد الأدنى وتحديد الأولويات.</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'exports' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">🚢 إدارة التصدير</h2>
              <p className="text-slate-600 mb-5">متابعة شحنات الصادرات وسجل الطلبات الجاهزة للشحن.</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl">
                  <h3 className="font-bold mb-3">شحنات مبيعات قيد المتابعة</h3>
                  <div className="space-y-3">
                    {sales.slice(0, 5).map((sale, index) => (
                      <div key={index} className="border-b last:border-b-0 pb-3">
                        <p className="font-semibold">فاتورة {sale.invoice}</p>
                        <p className="text-sm text-slate-600">عميل: {sale.customer} - صنف: {sale.product} - كمية: {sale.qty}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl">
                  <h3 className="font-bold mb-3">حالة التصدير</h3>
                  <p className="text-slate-600">عرض سريع لحالات الشحن ومراجعة المسار.</p>
                  <p className="text-sm text-slate-500">يمكنك إضافة نظام تتبع شحنات حقيقي لاحقاً لربط الطلبات بمكاتب الشحن.</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'reports' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">📊 التقارير والتحليلات</h2>
              <p className="text-slate-600 mb-5">ملخص الأداء المالي والمبيعات حسب العملاء والمنتجات.</p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl">
                  <h3 className="font-bold mb-3">أعلى المنتجات مبيعاً</h3>
                  {topProducts.length ? topProducts.map(([product, qty], index) => (
                    <div key={index} className="border-b last:border-b-0 py-3">
                      <p className="font-semibold">{product}</p>
                      <p className="text-sm text-slate-600">الكمية المباعة: {qty}</p>
                    </div>
                  )) : <p className="text-slate-600">لا توجد بيانات مبيعات كافية.</p>}
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl">
                  <h3 className="font-bold mb-3">إيرادات العملاء</h3>
                  {revenueByCustomer.length ? revenueByCustomer.slice(0, 3).map((customer, index) => (
                    <div key={index} className="border-b last:border-b-0 py-3">
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-sm text-slate-600">الإيرادات: {customer.revenue.toLocaleString()} ج</p>
                    </div>
                  )) : <p className="text-slate-600">لا توجد بيانات لعرضها.</p>}
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl">
                  <h3 className="font-bold mb-3">تكلفة المصاريف</h3>
                  <p className="text-slate-600">إجمالي المصاريف الحالي: {totalExpenses.toLocaleString()} ج</p>
                  <p className="text-sm text-slate-500">يمكن تحميل تقارير أدق بإضافة أنواع المصاريف وتواريخها.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {message && (
          <div className="fixed bottom-6 left-6 bg-black text-white px-4 py-2 rounded">{message}</div>
        )}

      </div>
    </div>
  )
}
