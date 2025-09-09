
import { Route, Routes, Link, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import POS from './pages/POS'
import Orders from './pages/Orders'
import Inventory from './pages/Inventory'
import Dashboard from './pages/Dashboard'
import CMS from './pages/CMS'
import Profile from './pages/Profile'
import { useSession, signOut } from './lib/auth'

export default function App(){
  const session = useSession()
  const nav = useNavigate()

  if(!session) return <Login />

  return (
    <div>
      <div className="topbar no-print">
        <Link to="/">POS</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/inventory">Inventory</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/cms">CMS</Link>
        <Link to="/profile">Profile</Link>
        <div style={{flex:1}}/>
        <button className="btn" onClick={()=>{signOut(); nav(0)}}>Sign out</button>
      </div>
      <div className="container">
        <Routes>
          <Route path="/" element={<POS/>}/>
          <Route path="/orders" element={<Orders/>}/>
          <Route path="/inventory" element={<Inventory/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/cms" element={<CMS/>}/>
          <Route path="/profile" element={<Profile/>}/>
        </Routes>
      </div>
    </div>
  )
}
