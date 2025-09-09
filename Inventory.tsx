
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Product = { id:string, name:string, price:number }
type Stock = { product_id:string, stock:number }

export default function Inventory(){
  const [products,setProducts] = useState<Product[]>([])
  const [stock,setStock] = useState<Record<string, number>>({})
  const [qty,setQty] = useState(10)

  useEffect(()=>{
    supabase.from('products').select('id,name,price').then(({data})=> setProducts(data||[]))
    supabase.from('v_product_stock').select('*').then(({data})=> {
      const map: Record<string,number> = {}
      ;(data||[]).forEach((r:any)=> map[r.product_id] = Number(r.stock))
      setStock(map)
    })
  },[])

  async function addStock(id:string, qty:number){
    await supabase.from('stock_movements').insert({ product_id:id, qty, type:'IN', note: 'Manual IN' })
    const { data } = await supabase.from('v_product_stock').select('*')
    const map: Record<string,number> = {}
    ;(data||[]).forEach((r:any)=> map[r.product_id] = Number(r.stock))
    setStock(map)
  }

  return (
    <div className="grid">
      <div className="card">
        <h3>Quick Stock IN</h3>
        <div className="grid" style={{gridTemplateColumns:'1fr auto'}}>
          <input className="input" type="number" value={qty} onChange={e=>setQty(parseInt(e.target.value||'0'))}/>
          <div className="badge">Qty</div>
        </div>
        <p style={{opacity:.7}}>Click a product below to stock-in by the above quantity.</p>
      </div>
      <div className="grid grid-3">
        {products.map(p=> (
          <button key={p.id} className="card" onClick={()=> addStock(p.id, qty)}>
            <div style={{fontWeight:600}}>{p.name}</div>
            <div>Stock: {stock[p.id] ?? 0}</div>
            <div>Price: {p.price?.toFixed(2)}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
