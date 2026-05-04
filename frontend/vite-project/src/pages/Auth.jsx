import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    try {
      const payload = isRegister
        ? form
        : { email: form.email, password: form.password }

      const response = isRegister
        ? await authAPI.register(payload)
        : await authAPI.login(payload)

      const token = response.data.access_token
      login(token)
      navigate('/dashboard')
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Unable to reach server. Please check backend is running and allowed by CORS.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 61px)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>

      <div style={{ width: '100%', maxWidth: 420, background: '#13131A',
        border: '1px solid #2A2A38', borderRadius: 20, padding: '2.5rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: '1.8rem', fontWeight: 700 }}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ color: '#8A8A9E', fontSize: 14 }}>
            {isRegister ? 'Start analyzing resumes for free' : 'Sign in to access your dashboard'}
          </p>
        </div>

        {isRegister && (
          <div style={{ marginBottom: '1rem' }}>
            <label>Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            onKeyDown={(event) => event.key === 'Enter' && handleSubmit()}
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,0,0,0.1)',
            border: '1px solid rgba(255,0,0,0.3)',
            borderRadius: 8,
            padding: 10,
            marginBottom: '1rem',
            color: 'red'
          }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} style={buttonStyle} disabled={loading}>
          {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
        </button>

        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <span
            onClick={() => setIsRegister(!isRegister)}
            style={{ color: '#6C63FF', cursor: 'pointer', marginLeft: 5 }}
          >
            {isRegister ? 'Sign In' : 'Create one'}
          </span>
        </p>

      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginTop: 5,
  borderRadius: 8,
  border: '1px solid #ccc'
}

const buttonStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: 8,
  background: '#6C63FF',
  color: 'white',
  border: 'none',
  cursor: 'pointer'
}