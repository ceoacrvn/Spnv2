
import { useState } from 'react'
import { signInWithEmail } from '../lib/auth'

export default function Login(){
  const [email,setEmail] = useState('admin@example.com')
  const [password,setPassword] = useState('password')
  const [loading,setLoading] = useState(false)
  const [err,setErr] = useState<string|undefined>()

  async function onSubmit(e:any){
    e.preventDefault()
    setErr(undefined)
    setLoading(true)
    try{
      await signInWithEmail(email,password)
    }catch(e:any){
      setErr(e.message)
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{maxWidth:420, marginTop:60}}>
      <h2>Sign in</h2>
      <form onSubmit={onSubmit} className="grid">
        <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/>
        <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password"/>
        {err && <div className="card" style={{color:'crimson'}}>{err}</div>}
        <button className="btn" disabled={loading}>{loading? 'Signing in...':'Sign in'}</button>
      </form>
      <p style={{opacity:.7, marginTop:8}}>Use Supabase Auth to create a user.</p>
    </div>
  )
}
