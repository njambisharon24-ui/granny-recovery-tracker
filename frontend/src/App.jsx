import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { getCurrentUser, loginUser } from './api'
import AppLayout from './components/AppLayout'
import BloodPressurePage from './pages/BloodPressurePage'
import DailyCheckInPage from './pages/DailyCheckInPage'
import DashboardPage from './pages/DashboardPage'
import EmergencyPage from './pages/EmergencyPage'
import ExercisesPage from './pages/ExercisesPage'
import LoginPage from './pages/LoginPage'
import MedicationPage from './pages/MedicationPage'
import NotesPage from './pages/NotesPage'
import PrivacySecurityPage from './pages/PrivacySecurityPage'
import ProgressPage from './pages/ProgressPage'
import SettingsPage from './pages/SettingsPage'
import './App.css'

const defaultUser = { id: null, name: 'Caregiver', email: '' }

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('granny_recovery_token') || '')
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('granny_recovery_user')
    if (!saved) return defaultUser

    try {
      return JSON.parse(saved)
    } catch {
      return defaultUser
    }
  })
  const [loginForm, setLoginForm] = useState({ email: 'caregiver@example.com', password: 'password123' })
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    if (!token) {
      setUser(defaultUser)
      return
    }

    getCurrentUser(token)
      .then((currentUser) => {
        setUser(currentUser)
        localStorage.setItem('granny_recovery_user', JSON.stringify(currentUser))
      })
      .catch(() => {
        handleLogout()
      })
  }, [token])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const result = await loginUser(loginForm.email, loginForm.password)
      setToken(result.token)
      setUser(result.user)
      setLoginError('')
      localStorage.setItem('granny_recovery_token', result.token)
      localStorage.setItem('granny_recovery_user', JSON.stringify(result.user))
    } catch (error) {
      setLoginError(error.message || 'Unable to sign in with those credentials.')
    }
  }

  const handleLogout = () => {
    setToken('')
    setUser(defaultUser)
    setLoginError('')
    localStorage.removeItem('granny_recovery_token')
    localStorage.removeItem('granny_recovery_user')
  }

  if (!token) {
    return (
      <LoginPage
        loginForm={loginForm}
        onFieldChange={(field, value) => setLoginForm((previous) => ({ ...previous, [field]: value }))}
        onSubmit={handleLogin}
        loginError={loginError}
      />
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout onLogout={handleLogout} user={user} />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage user={user} token={token} />} />
          <Route path="/daily-checkin" element={<DailyCheckInPage token={token} />} />
          <Route path="/exercises" element={<ExercisesPage token={token} />} />
          <Route path="/medication" element={<MedicationPage token={token} />} />
          <Route path="/blood-pressure" element={<BloodPressurePage token={token} />} />
          <Route path="/progress" element={<ProgressPage token={token} />} />
          <Route path="/notes" element={<NotesPage token={token} />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/privacy-security" element={<PrivacySecurityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
