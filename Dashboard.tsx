
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import dayjs from 'dayjs'

type Daily = { day:string, sales_total:number, sales_subtotal:number, discount_total:number, tax_total:number }
type COGSRow = { day:string, cogs_total:number }

export default function Dashboard(){
  const [rows,setRows] = useState<Daily[]>([])
  const [cogs,setCogs] = useState<COGSRow[]>([])

  useEffect(()=>{
    supabase.from('v_sales_daily').select('*').then(({data})=> setRows(data||[]))
    supabase.from('v_cogs_daily').select('*').then(({data})=> setCogs(data||[]))
  },[])

  // Join by day to show P&L (sales - cogs)
  const merged = rows.map(r=> ({
    day: r.day,
    sales: Number(r.sales_total||0),
    cogs: Number((cogs.find(c=> c.day===r.day)?.cogs_total) || 0),
    gross: Number(r.sales_total||0) - Number((cogs.find(c=> c.day===r.day)?.cogs_total) || 0)
  }))

  return (
    <div>
      <h3>Dashboard — Daily Sales & COGS</h3>
      <table className="table">
        <thead><tr><th>Date</th><th>Sales</th><th>COGS</th><th>Gross</th></tr></thead>
        <tbody>
          {merged.map(m=> (
            <tr key={m.day}>
              <td>{dayjs(m.day).format('YYYY-MM-DD')}</td>
              <td style={{textAlign:'right'}}>{m.sales.toFixed(2)}</td>
              <td style={{textAlign:'right'}}>{m.cogs.toFixed(2)}</td>
              <td style={{textAlign:'right'}}>{m.gross.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
