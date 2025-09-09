
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type OrderRow = { id:string, status:string, total:number, settled_at:string }

export default function Orders(){
  const [rows,setRows] = useState<OrderRow[]>([])

  useEffect(()=>{
    supabase.from('orders').select('id,status,total,settled_at').order('settled_at', { ascending:false }).then(({data})=> setRows(data||[]))
  },[])

  return (
    <div>
      <h3>Orders</h3>
      <table className="table">
        <thead><tr><th>ID</th><th>Status</th><th>Settled</th><th style={{textAlign:'right'}}>Total</th></tr></thead>
        <tbody>
          {rows.map(r=> (
            <tr key={r.id}>
              <td style={{fontFamily:'monospace'}}>{r.id.slice(0,8)}</td>
              <td><span className="badge">{r.status}</span></td>
              <td>{r.settled_at?.replace('T',' ').slice(0,16)}</td>
              <td style={{textAlign:'right'}}>{r.total?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
