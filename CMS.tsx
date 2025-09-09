
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Page = { id:string, slug:string, title:string, content:string }

export default function CMS(){
  const [pages,setPages] = useState<Page[]>([])
  const [editing, setEditing] = useState<Page|null>(null)
  const [title,setTitle] = useState('')
  const [slug,setSlug] = useState('')
  const [content,setContent] = useState('')

  useEffect(()=>{ load() },[])

  async function load(){
    const { data } = await supabase.from('cms_pages').select('*').order('updated_at',{ascending:false})
    setPages(data||[])
  }

  async function save(){
    if(editing){
      await supabase.from('cms_pages').update({ title, content, updated_at: new Date().toISOString() }).eq('id', editing.id)
    }else{
      await supabase.from('cms_pages').insert({ slug, title, content })
    }
    setEditing(null); setTitle(''); setSlug(''); setContent('')
    load()
  }

  async function edit(p:Page){
    setEditing(p); setTitle(p.title); setContent(p.content); setSlug(p.slug)
  }

  async function del(id:string){
    if(!confirm('Delete page?')) return
    await supabase.from('cms_pages').delete().eq('id', id)
    load()
  }

  return (
    <div className="grid">
      <div className="card">
        <h3>Pages</h3>
        <div style={{display:'flex', gap:8}}>
          <input className="input" placeholder="Slug" value={slug} onChange={e=>setSlug(e.target.value)}/>
          <input className="input" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)}/>
        </div>
        <textarea className="input" style={{height:120}} value={content} onChange={e=>setContent(e.target.value)}/>
        <div style={{display:'flex', gap:8, marginTop:8}}>
          <button className="btn" onClick={save}>Save</button>
          <button className="btn" onClick={()=>{ setEditing(null); setTitle(''); setSlug(''); setContent('') }}>Clear</button>
        </div>
      </div>
      <div>
        <h3>Existing</h3>
        <table className="table">
          <thead><tr><th>Slug</th><th>Title</th><th></th></tr></thead>
          <tbody>
            {pages.map(p=> (
              <tr key={p.id}>
                <td style={{fontFamily:'monospace'}}>{p.slug}</td>
                <td>{p.title}</td>
                <td>
                  <button className="btn" onClick={()=>edit(p)}>Edit</button>
                  <button className="btn" onClick={()=>del(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{opacity:.7}}>Personalization: go to <b>Profile → Set theme</b> (coming)</p>
      </div>
    </div>
  )
}
