import { useState } from 'react'
import Dashboard from './Dashboard'
import './App.css'

function App() {
  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem('accessToken'))
  )
  const [showRegister, setShowRegister] = useState(false)
  const [name, setName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('http://localhost:5001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Login failed')
        return
      }

      localStorage.setItem('accessToken', data.accessToken)
      setLoggedIn(true)

    } catch (error) {
      setError('Unable to connect to server')
    }
  }
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('http://localhost:5001/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email: registerEmail,
          password: registerPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Registration failed')
        return
      }

      setShowRegister(false)
      setName('')
      setRegisterEmail('')
      setRegisterPassword('')
      setError('')
    } catch {
      setError('Unable to connect to server')
    }
  }
  if (loggedIn) {
    return <Dashboard />
  }

  return (
    <div>
      <div className="login-page">
        <div className="login-card">
          <h1>Velozity Dashboard</h1>

          {!showRegister ? (
            <>
              <h2>Welcome Back</h2>
              <p>Sign in to your dashboard</p>
              <form onSubmit={handleLogin}>
                <label>Email</label>
                <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />

                <label>Password</label>
                <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />

                <button type="submit">Login</button>
              </form>
              <button
                type="button"
                onClick={() => {
                  setShowRegister(true)
                  setError('')
                }}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              <h2>Welcome</h2>
              <p>Sign up to your dashboard</p>
              <form onSubmit={handleRegister}>
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                />

                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                />

                <label>Role</label>
                <select value="DEVELOPER" disabled>
                  <option value="DEVELOPER">Developer</option>
                </select>

                <button type="submit">Register</button>
              </form>
              <button
                type="button"
                onClick={() => {
                  setShowRegister(false)
                  setError('')
                }}
              >
                Back to Login
              </button>
            </>
          )}
          {error && <p className="error-message">{error}</p>}

          <small>Secure access with JWT authentication</small>
        </div>
      </div>
    </div>

  )
}

export default App
