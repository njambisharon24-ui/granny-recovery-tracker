import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'

const mobilityScale = {
  Independent: 5,
  Improving: 4,
  'Needs support': 3,
  'Limited mobility': 2,
  Bedridden: 1,
}

const defaultForm = {
  date: new Date().toISOString().slice(0, 10),
  mobility: 'Improving',
  speech: 'More clear',
  exercises_done: true,
  medication_taken: true,
  blood_pressure: '120/80',
  notes: '',
}

const demoCredentials = {
  email: 'caregiver@example.com',
  password: 'password123',
}

function App() {
  const [form, setForm] = useState(defaultForm)
  const [observations, setObservations] = useState([])
  const [patients, setPatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState(1)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [view, setView] = useState('dashboard')
  const [summary, setSummary] = useState({
    risk_level: 'No data',
    total_entries: 0,
    exercises_completed: 0,
    last_update: null,
    average_blood_pressure: 'N/A',
    ai_summary: 'No summary generated yet.',
  })
  const [status, setStatus] = useState('')
  const [token, setToken] = useState('')
  const [user, setUser] = useState(null)
  const [signal, setSignal] = useState('')

  const fetchData = async (authToken = '') => {
    try {
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {}
      const [obsResponse, summaryResponse, patientResponse] = await Promise.all([
        fetch('http://localhost:8000/observations', { headers }),
        fetch('http://localhost:8000/summary', { headers }),
        fetch('http://localhost:8000/patients', { headers }),
      ])

      if (!obsResponse.ok || !summaryResponse.ok || !patientResponse.ok) {
        throw new Error('Failed to load app data')
      }

      const [obsData, summaryData, patientData] = await Promise.all([
        obsResponse.json(),
        summaryResponse.json(),
        patientResponse.json(),
      ])

      setObservations(obsData)
      setSummary(summaryData)
      setPatients(patientData)
      if (patientData.length > 0) {
        setSelectedPatientId(patientData[0].id)
      }
    } catch (error) {
      console.error(error)
      setStatus('Backend not running yet. Start the FastAPI server on port 8000.')
    }
  }

  const fetchSelectedPatient = async (patientId, authToken = '') => {
    try {
      const response = await fetch(`http://localhost:8000/patients/${patientId}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })
      if (!response.ok) throw new Error('Failed to fetch patient details')
      const payload = await response.json()
      setSelectedPatient(payload)
    } catch (error) {
      console.error(error)
    }
  }

  const loginDemoUser = async () => {
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoCredentials),
      })

      if (!response.ok) throw new Error('Unable to log in as demo caregiver')

      const payload = await response.json()
      setToken(payload.token)
      setUser(payload.user)
      setSignal('Authenticated as demo caregiver')
      await fetchData(payload.token)
      await fetchSelectedPatient(payload.user.id, payload.token)
    } catch (error) {
      console.error(error)
      setStatus('Demo login failed. The backend is likely not running.')
    }
  }

  useEffect(() => {
    loginDemoUser()
  }, [])

  useEffect(() => {
    if (!selectedPatientId) return
    fetchSelectedPatient(selectedPatientId, token)
  }, [selectedPatientId, token])

  const chartData = useMemo(
    () =>
      observations.map((entry) => ({
        day: entry.date.slice(5),
        mobility: mobilityScale[entry.mobility] ?? 0,
        systolic: Number.parseInt(entry.blood_pressure?.split('/')?.[0] || '0', 10),
      })),
    [observations],
  )

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const response = await fetch('http://localhost:8000/observations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) throw new Error('Failed to save observation')

      setStatus('Observation saved successfully.')
      setForm(defaultForm)
      await fetchData(token)
      if (selectedPatientId) {
        await fetchSelectedPatient(selectedPatientId, token)
      }
    } catch (error) {
      console.error(error)
      setStatus('Failed to save. Make sure the backend is running.')
    }
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    const name = event.target.name.value
    const email = event.target.email.value
    const password = event.target.password.value

    try {
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) throw new Error('Registration failed')
      const payload = await response.json()
      setToken(payload.token)
      setUser(payload.user)
      setSignal('New caregiver account created')
      await fetchData(payload.token)
    } catch (error) {
      console.error(error)
      setStatus('Registration failed. Check the backend and credentials.')
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Caregiver dashboard</p>
          <h1>Granny Recovery Tracker</h1>
        </div>
        <div className="topbar-actions">
          <span className="badge">{summary.risk_level}</span>
          {user ? <span className="user-pill">{user.name}</span> : <span className="user-pill muted">Demo user</span>}
        </div>
      </header>

      <nav className="nav-tabs">
        <button type="button" className={view === 'dashboard' ? 'tab active' : 'tab'} onClick={() => setView('dashboard')}>
          Dashboard
        </button>
        <button type="button" className={view === 'patient' ? 'tab active' : 'tab'} onClick={() => setView('patient')}>
          Patient details
        </button>
      </nav>

      <main className="dashboard">
        <section className="panel form-panel">
          <h2>Account access</h2>
          <form onSubmit={handleRegister} className="inline-form">
            <input name="name" placeholder="Caregiver name" required />
            <input name="email" type="email" placeholder="Email" required />
            <input name="password" type="password" placeholder="Password" required />
            <button type="submit" className="secondary-button">Register caregiver</button>
          </form>
          {signal && <p className="status soft">{signal}</p>}

          <h2 className="section-title">Log daily observation</h2>

          <form onSubmit={handleSubmit} className="entry-form">
            <label>
              Date
              <input type="date" name="date" value={form.date} onChange={handleChange} />
            </label>

            <label>
              Mobility
              <select name="mobility" value={form.mobility} onChange={handleChange}>
                <option>Independent</option>
                <option>Improving</option>
                <option>Needs support</option>
                <option>Limited mobility</option>
                <option>Bedridden</option>
              </select>
            </label>

            <label>
              Speech
              <input
                type="text"
                name="speech"
                value={form.speech}
                onChange={handleChange}
                placeholder="More clear"
              />
            </label>

            <label>
              Blood pressure
              <input
                type="text"
                name="blood_pressure"
                value={form.blood_pressure}
                onChange={handleChange}
                placeholder="120/80"
              />
            </label>

            <label>
              Care notes
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="What changed today?"
                rows="3"
              />
            </label>

            <div className="checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="exercises_done"
                  checked={form.exercises_done}
                  onChange={handleChange}
                />
                Exercises completed
              </label>

              <label>
                <input
                  type="checkbox"
                  name="medication_taken"
                  checked={form.medication_taken}
                  onChange={handleChange}
                />
                Medication taken
              </label>
            </div>

            <button type="submit">Save observation</button>
          </form>

          {status && <p className="status">{status}</p>}
        </section>

        <section className="panel summary-panel">
          {view === 'dashboard' ? (
            <>
              <h2>Recovery snapshot</h2>

              <div className="stats-grid">
                <div className="stat-card">
                  <span>Total entries</span>
                  <strong>{summary.total_entries || observations.length}</strong>
                </div>
                <div className="stat-card">
                  <span>Exercise adherence</span>
                  <strong>{summary.exercises_completed || observations.filter((item) => item.exercises_done).length}</strong>
                </div>
                <div className="stat-card">
                  <span>Avg systolic</span>
                  <strong>{summary.average_blood_pressure || 'N/A'}</strong>
                </div>
                <div className="stat-card">
                  <span>Last update</span>
                  <strong>{summary.last_update || 'N/A'}</strong>
                </div>
              </div>

              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e7e5eb" />
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis domain={[0, 5]} stroke="#6b7280" />
                    <Tooltip />
                    <Line type="monotone" dataKey="mobility" stroke="#6d5efc" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="ai-panel">
                <h3>AI recovery summary</h3>
                <p>{summary.ai_summary}</p>
              </div>

              <div className="recent-panel">
                <h3>Recent observations</h3>
                <ul className="recent-list">
                  {observations.slice(-4).reverse().map((entry) => (
                    <li key={`${entry.date}-${entry.speech}`}>
                      <span>{entry.date}</span>
                      <strong>{entry.mobility}</strong>
                      <small>{entry.speech}</small>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <>
              <h2>Patient details</h2>
              <div className="patient-controls">
                <label>
                  Patient
                  <select value={selectedPatientId || ''} onChange={(event) => setSelectedPatientId(Number(event.target.value))}>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {selectedPatient && (
                <>
                  <div className="patient-header">
                    <div>
                      <p className="eyebrow muted">Patient profile</p>
                      <h3>{selectedPatient.patient.name}</h3>
                    </div>
                    <span className="badge accent">{selectedPatient.summary.risk_level}</span>
                  </div>

                  <div className="stats-grid compact">
                    <div className="stat-card">
                      <span>Entries</span>
                      <strong>{selectedPatient.summary.total_entries}</strong>
                    </div>
                    <div className="stat-card">
                      <span>Last update</span>
                      <strong>{selectedPatient.summary.last_update || 'N/A'}</strong>
                    </div>
                  </div>

                  <ul className="detail-list">
                    {selectedPatient.observations.map((entry) => (
                      <li key={entry.id}>
                        <div className="detail-topline">
                          <span>{entry.date}</span>
                          <strong>{entry.mobility}</strong>
                        </div>
                        <p>{entry.speech}</p>
                        <small>{entry.notes || 'No additional notes.'}</small>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
