import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard.jsx'
import { useAuth } from './hooks/useAuth'

export default function App() {
  const { user } = useAuth()

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
        <Route path="/dashboard/*" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
      </Routes>
    </div>
  )
}