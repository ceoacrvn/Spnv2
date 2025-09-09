
import { create } from 'zustand'

type Item = { id: string, name: string, price: number, qty: number }
type State = {
  items: Item[]
  add: (p: {id:string,name:string,price:number})=>void
  remove: (id: string)=>void
  inc: (id: string)=>void
  dec: (id: string)=>void
  clear: ()=>void
  subtotal: ()=>number
}

export const useCart = create<State>((set,get)=>({
  items: [],
  add: (p)=> set(s=>{
    const idx = s.items.findIndex(i=>i.id===p.id)
    if(idx>-1){
      const items = [...s.items]
      items[idx].qty += 1
      return { items }
    }
    return { items: [...s.items, { ...p, qty:1 }] }
  }),
  remove: (id)=> set(s=>({ items: s.items.filter(i=>i.id!==id) })),
  inc: (id)=> set(s=>({ items: s.items.map(i=> i.id===id ? {...i, qty:i.qty+1}:i ) })),
  dec: (id)=> set(s=>({ items: s.items.flatMap(i=> i.id===id ? (i.qty>1? [{...i, qty:i.qty-1}] : []) : [i]) })),
  clear: ()=> set({ items: [] }),
  subtotal: ()=> get().items.reduce((a,i)=> a + i.price*i.qty, 0)
}))
