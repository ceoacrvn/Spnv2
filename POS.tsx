
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCart } from '../lib/store'
import dayjs from 'dayjs'
import { pushOfflineOrder, getOfflineQueue, clearOfflineQueue } from '../lib/offline'

type Product = { id:string, name:string, price:number }
type Order = { id:string }

export default function POS(){
  const [products,setProducts] = useState<Product[]>([])
  const [query,setQuery] = useState('')
  const [settled,setSettled] = useState<any>(null)
  const [method,setMethod] = useState<'CASH'|'CARD'|'E-WALLET'>('CASH')
  const cart = useCart()

  useEffect(()=>{
    supabase.from('products').select('id,name,price').eq('is_active',true).then(({data})=> setProducts(data||[]))
    trySyncOffline()
  },[])

  const filtered = useMemo(()=>{
    const q = query.toLowerCase()
    return products.filter(p=> p.name.toLowerCase().includes(q))
  },[products,query])

  async function trySyncOffline(){
    const q = getOfflineQueue()
    if(q.length===0) return
    for(const o of q){
      try{
        const { data: order } = await supabase.from('orders').insert({
          status: 'SETTLED',
          subtotal: o.subtotal, discount: o.discount, tax: o.tax, total: o.total,
          note: 'Offline sync',
          settled_at: o.settled_at
        }).select().single()
        if(order){
          await supabase.from('order_items').insert(o.items.map((it:any)=> ({ ...it, order_id: order.id })))
          await supabase.from('payments').insert({ order_id: order.id, method: o.method, amount: o.total })
        }
      }catch(e){ console.warn('offline sync fail', e) }
    }
    clearOfflineQueue()
    window.location.reload()
  }

  async function settle(){
    const subtotal = cart.subtotal()
    const discount = 0
    const tax = 0
    const total = subtotal - discount + tax

    // If offline, push to local queue and show receipt locally
    if(!navigator.onLine){
      const offlineOrder = {
        subtotal, discount, tax, total, items: cart.items.map(i=> ({ product_id:i.id, name:i.name, price:i.price, qty:i.qty, line_total: i.price*i.qty })),
        settled_at: new Date().toISOString(), method: method
      }
      pushOfflineOrder(offlineOrder)
      setSettled({ order: offlineOrder, items: offlineOrder.items, total })
      cart.clear()
      setTimeout(()=> window.print(), 300)
      return
    }

    const { data: order, error } = await supabase.from('orders').insert({
      status: 'SETTLED',
      subtotal, discount, tax, total,
      note: 'POS quick sale',
      settled_at: new Date().toISOString()
    }).select().single()

    if(error) { alert(error.message); return }
    const items = cart.items.map(i=>({
      order_id: order.id,
      product_id: i.id,
      name: i.name,
      price: i.price,
      qty: i.qty,
      line_total: i.price * i.qty
    }))

    const { error: e2 } = await supabase.from('order_items').insert(items)
    if(e2) { alert(e2.message); return }

    const { error: e3 } = await supabase.from('payments').insert({
      order_id: order.id,
      method, // CASH/CARD/E-WALLET
      amount: total
    })
    if(e3) { alert(e3.message); return }

    setSettled({ order, items, total })
    cart.clear()
    setTimeout(()=> window.print(), 300)
  }

  return (
    <div className="grid" style={{gridTemplateColumns:'2fr 1fr'}}>
      <div>
        <div className="grid" style={{gridTemplateColumns:'1fr auto'}}>
          <input className="input" placeholder="Search product..." value={query} onChange={e=>setQuery(e.target.value)}/>
          <div style={{display:'flex', gap:8}}>
            <select value={method} onChange={e=> setMethod(e.target.value as any)} className="input" style={{width:140}}>
              <option value="CASH">CASH</option>
              <option value="CARD">CARD</option>
              <option value="E-WALLET">E-WALLET</option>
            </select>
            <button className="btn no-print" onClick={()=>settle()} disabled={cart.items.length===0}>Settle & Print</button>
          </div>
        </div>
        <div className="grid grid-3" style={{marginTop:12}}>
          {filtered.map(p=> (
            <button key={p.id} className="card" onClick={()=> cart.add(p)}>
              <div style={{fontWeight:600}}>{p.name}</div>
              <div style={{opacity:.7}}>{p.price.toFixed(2)}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="card">
          <h3>Cart</h3>
          {cart.items.length===0 && <div style={{opacity:.7}}>Empty</div>}
          {cart.items.map(i=> (
            <div key={i.id} style={{display:'flex', gap:8, alignItems:'center', margin:'6px 0'}}>
              <div style={{flex:1}}>{i.name}</div>
              <button className="btn" onClick={()=>cart.dec(i.id)}>-</button>
              <div>{i.qty}</div>
              <button className="btn" onClick={()=>cart.inc(i.id)}>+</button>
              <div style={{width:80, textAlign:'right'}}>{(i.qty*i.price).toFixed(2)}</div>
              <button className="btn" onClick={()=>cart.remove(i.id)}>x</button>
            </div>
          ))}
          <hr/>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <div>Subtotal</div><b>{cart.subtotal().toFixed(2)}</b>
          </div>
        </div>

        {settled && (
          <div className="print-receipt card" style={{marginTop:12}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontWeight:700}}>RECEIPT</div>
              <div>{dayjs(settled.order.settled_at || settled.order.settled_at).format ? dayjs(settled.order.settled_at).format('YYYY-MM-DD HH:mm') : (settled.order.settled_at || '')}</div>
            </div>
            <div style={{marginTop:8}}>
              {settled.items.map((i:any)=>(
                <div key={i.product_id || i.name} style={{display:'flex', justifyContent:'space-between'}}>
                  <div>{i.name} x{i.qty}</div>
                  <div>{(i.line_total || (i.qty*i.price)).toFixed(2)}</div>
                </div>
              ))}
              <hr/>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <div>Total</div><b>{settled.total.toFixed(2)}</b>
              </div>
              <div>Paid: {method}</div>
              <div style={{textAlign:'center', marginTop:8}}>Thanks!</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
