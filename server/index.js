const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const DATA_PATH = path.join(__dirname, 'data.json')

const defaultData = {
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

function loadData(){
  try{
    if(fs.existsSync(DATA_PATH)){
      const raw = fs.readFileSync(DATA_PATH, 'utf8')
      return JSON.parse(raw)
    }
  }catch(err){ console.error('loadData error', err) }
  return defaultData
}

function saveData(data){
  try{
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8')
  }catch(err){ console.error('saveData error', err) }
}

const app = express()
app.use(cors())
app.use(express.json())

let db = loadData()

app.get('/api/alerts', (req,res)=> res.json(db.alerts))
app.get('/api/products', (req,res)=> res.json(db.products))
app.get('/api/customers', (req,res)=> res.json(db.customers))
app.get('/api/sales', (req,res)=> res.json(db.sales))
app.get('/api/expenses', (req,res)=> res.json(db.expenses))

app.post('/api/sales', (req,res)=>{
  const sale = req.body
  const next = 'SAL-' + String((db.sales.length + 1)).padStart(3,'0')
  const created = { invoice: next, ...sale }
  db.sales.unshift(created)
  const p = db.products.find(x=>x.name === sale.product)
  if(p) p.stock = Math.max(0, p.stock - Number(sale.qty || 0))
  saveData(db)
  res.status(201).json(created)
})

app.post('/api/products', (req,res)=>{
  const product = req.body
  db.products.push(product)
  saveData(db)
  res.status(201).json(product)
})

app.post('/api/customers', (req,res)=>{
  const customer = req.body
  db.customers.push(customer)
  saveData(db)
  res.status(201).json(customer)
})

const PORT = process.env.PORT || 4000
app.listen(PORT, ()=> console.log('Server running on', PORT))
