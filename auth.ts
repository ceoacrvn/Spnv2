
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useSession(){
  const [session, setSession] = useState<any>(null)
  useEffect(()=>{
    supabase.auth.getSession().then(({ data })=> setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s)=> setSession(s))
    return ()=>{ sub.subscription.unsubscribe() }
  },[])
  return session
}

export async function signInWithEmail(email: string, password: string){
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if(error) throw error
}

export async function signOut(){
  await supabase.auth.signOut()
}
