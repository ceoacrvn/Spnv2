
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Profile(){
  const [settings, setSettings] = useState<any>({})
  const [accent, setAccent] = useState('#0078d7')
  const [theme, setTheme] = useState('light')

  useEffect(()=>{ load() },[])

  async function load(){
    const uid = (await supabase.auth.getSession()).data?.session?.user?.id
    if(!uid) return
    const { data } = await supabase.from('personalizations').select('*').eq('user_id', uid)
    const map:any = {}
    (data||[]).forEach((r:any)=> map[r.key]=r.value)
    setSettings(map)
    if(map.accentColor) setAccent(map.accentColor)
    if(map.theme) setTheme(map.theme)
  }

  async function save(){
    const uid = (await supabase.auth.getSession()).data?.session?.user?.id
    if(!uid) return
    await supabase.from('personalizations').upsert([
      { user_id: uid, key: 'accentColor', value: accent },
      { user_id: uid, key: 'theme', value: theme }
    ], { onConflict: ['user_id','key'] })
    alert('Saved')
  }

  return (
    <div className="card">
      <h3>Profile & Personalization</h3>
      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <label>Accent</label>
        <input type="color" value={accent} onChange={e=>setAccent(e.target.value)}/>
        <label>Theme</label>
        <select value={theme} onChange={e=>setTheme(e.target.value)} className="input" style={{width:160}}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        <button className="btn" onClick={save}>Save</button>
      </div>
    </div>
  )
}
