import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <nav style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'1rem 2rem', borderBottom:'1px solid #2A2A38',
      background:'rgba(10,10,15,0.9)', position:'sticky', top:0, zIndex:100,
      backdropFilter:'blur(12px)'
    }}>
      <Link to="/home" style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'1.3rem',
        display:'flex', alignItems:'center', gap:8, color:'#F0EFF8', textDecoration:'none' }}>
        <span style={{ width:8, height:8, borderRadius:'50%', background:'#6C63FF',
          boxShadow:'0 0 12px #6C63FF', display:'inline-block' }}/>
        ResumeAI
      </Link>

      <div style={{ display:'flex', gap:'1.5rem', alignItems:'center' }}>
        <Link to="/home" style={{ color: location.pathname === '/home' ? '#F0EFF8' : '#8A8A9E',
          fontSize:14, textDecoration:'none', transition:'color 0.2s' }}>Home</Link>

        {user && <Link to="/dashboard" style={{ color: location.pathname.startsWith('/dashboard') ? '#F0EFF8' : '#8A8A9E',
          fontSize:14, textDecoration:'none' }}>Dashboard</Link>}

        {user ? (
          <button onClick={handleLogout} style={{
            background:'#6C63FF', color:'#fff', border:'none', padding:'8px 20px',
            borderRadius:8, fontSize:14, cursor:'pointer', fontFamily:'DM Sans,sans-serif'
          }}>Logout</button>
        ) : (
          <Link to="/auth" style={{
            background:'#6C63FF', color:'#fff', border:'none', padding:'8px 20px',
            borderRadius:8, fontSize:14, cursor:'pointer', textDecoration:'none', fontFamily:'DM Sans,sans-serif'
          }}>Get Started</Link>
        )}
      </div>
    </nav>
  )
}