import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getObservations, getSummary } from '../api'
import { weeklyProgress } from '../data'

function DashboardPage({ token, user }) {
  const [summary, setSummary] = useState(null)
  const [observations, setObservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return

    Promise.all([getSummary(token), getObservations(token)])
      .then(([summaryData, observationData]) => {
        setSummary(summaryData)
        setObservations(observationData)
        setError('')
      })
      .catch((loadError) => {
        setError(loadError.message || 'Unable to load recovery data.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [token])

  const latestObservation = observations[observations.length - 1] || null
  const recentNotes = useMemo(
    () =>
      observations
        .slice()
        .reverse()
        .filter((entry) => entry.notes)
        .slice(0, 3)
        .map((entry) => ({
          title: `Observation • ${entry.date}`,
          date: entry.date,
          detail: entry.notes,
        })),
    [observations],
  )

  const medicationText = latestObservation?.medication_taken ? 'Recorded' : 'Needs attention'
  const exercisePercent = summary && observations.length > 0 ? Math.min(100, Math.round((summary.exercises_completed / observations.length) * 100)) : 0
  const bloodPressure = latestObservation?.blood_pressure || summary?.average_blood_pressure || 'N/A'
  const mobilityStatus = latestObservation?.mobility || 'No recent entry'
  const speechStatus = latestObservation?.speech || 'No recent entry'

  return (
    <>
      <section className="panel hero-panel">
        <div>
          <p className="eyebrow muted">Welcome back</p>
          <h2>Welcome, {user?.name || 'Caregiver'}.</h2>
          <p className="hero-copy">
            Here is how today’s recovery tracking is going and what still needs attention.
          </p>
        </div>

        <div className="hero-metrics">
          <div className="mini-stat">
            <span>Today</span>
            <strong>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</strong>
          </div>
          <div className="mini-stat">
            <span>Medication</span>
            <strong>{medicationText}</strong>
          </div>
          <div className="mini-stat">
            <span>Blood pressure</span>
            <strong>{bloodPressure}</strong>
          </div>
        </div>
      </section>

      {error && <p className="login-error">{error}</p>}

      {!loading && (
        <>
          <section className="stats-grid">
            <article className="stat-card">
              <span>Medication status</span>
              <strong>{medicationText}</strong>
              <small>{latestObservation ? 'Latest recorded medication note is available.' : 'Medication has not been recorded yet today.'}</small>
            </article>

            <article className="stat-card">
              <span>Exercise completion</span>
              <strong>{exercisePercent}%</strong>
              <small>{summary ? `${summary.exercises_completed} recorded exercise entries.` : 'No exercise data yet.'}</small>
            </article>

            <article className="stat-card">
              <span>Walking / mobility</span>
              <strong>{mobilityStatus}</strong>
              <small>Latest caregiver observation for mobility.</small>
            </article>

            <article className="stat-card">
              <span>Speech / communication</span>
              <strong>{speechStatus}</strong>
              <small>Latest recorded speaking observation.</small>
            </article>
          </section>

          <div className="two-column-layout">
            <section className="panel">
              <h3>Today’s checklist</h3>
              <div className="checklist">
                <label className="check-row">
                  <input type="checkbox" checked={Boolean(latestObservation?.medication_taken)} readOnly />
                  Medication checked
                </label>
                <label className="check-row">
                  <input type="checkbox" checked={Boolean(latestObservation?.exercises_done)} readOnly />
                  Exercises completed
                </label>
                <label className="check-row">
                  <input type="checkbox" checked={Boolean(latestObservation?.blood_pressure)} readOnly />
                  Blood pressure logged
                </label>
                <label className="check-row">
                  <input type="checkbox" checked={Boolean(latestObservation?.notes)} readOnly />
                  Notes recorded
                </label>
              </div>
            </section>

            <section className="panel">
              <h3>AI Recovery Summary</h3>
              <p className="assistant-note">
                This is a summary of recorded information, not a medical diagnosis. Contact the healthcare professional for medical advice.
              </p>
              <ul className="summary-list">
                <li>{summary?.ai_summary || 'No summary available yet. Add a daily observation to begin tracking patterns.'}</li>
              </ul>
            </section>
          </div>

          <section className="panel">
            <div className="section-heading">
              <h3>Recent notes</h3>
              <span className="section-tag">Latest updates</span>
            </div>

            <div className="note-grid">
              {recentNotes.length > 0 ? (
                recentNotes.map((note) => (
                  <article key={`${note.title}-${note.date}`} className="note-card">
                    <span>{note.date}</span>
                    <h4>{note.title}</h4>
                    <p>{note.detail}</p>
                  </article>
                ))
              ) : (
                <article className="note-card">
                  <span>Not yet recorded</span>
                  <h4>No recent notes</h4>
                  <p>Add a daily check-in to capture observations.</p>
                </article>
              )}
            </div>
          </section>

          <section className="panel progress-panel">
            <div className="section-heading">
              <h3>Weekly progress</h3>
              <span className="section-tag">7 day view</span>
            </div>

            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={weeklyProgress}>
                <defs>
                  <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#cb6a5e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#cb6a5e" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e8ded8" strokeDasharray="4 4" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Area type="monotone" dataKey="mobility" stroke="#cb6a5e" fill="url(#progressFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </section>
        </>
      )}
    </>
  )
}

export default DashboardPage
