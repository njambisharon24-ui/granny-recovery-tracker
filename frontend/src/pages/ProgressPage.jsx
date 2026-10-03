import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getObservations } from '../api'
import { noteEntries, weeklyProgress } from '../data'

const mobilityScale = {
  'Unable today': 1,
  'Needs significant assistance': 2,
  'Needs some assistance': 3,
  'Able with little/no assistance': 4,
}

function ProgressPage({ token }) {
  const [progressRange, setProgressRange] = useState('7 days')
  const [observations, setObservations] = useState([])

  useEffect(() => {
    if (!token) return

    getObservations(token)
      .then((items) => setObservations(items))
      .catch(() => {})
  }, [token])

  const dataSource = observations.length
    ? observations.slice(-7).map((item) => ({
        name: item.date.slice(5),
        mobility: mobilityScale[item.mobility] || 2,
        exercise: item.exercises_done ? 100 : 25,
        blood: Number((item.blood_pressure || '120/80').split('/')[0]) || 120,
      }))
    : weeklyProgress

  const rangeData =
    progressRange === '30 days'
      ? dataSource.slice(-6)
      : progressRange === '90 days'
        ? dataSource.slice(-7)
        : dataSource

  const timelineData = observations.length
    ? observations
        .filter((item) => item.notes)
        .slice(-5)
        .reverse()
        .map((item) => ({
          title: `Observation • ${item.date}`,
          date: item.date,
          detail: item.notes,
        }))
    : noteEntries

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow muted">Recorded observations</p>
          <h2>Recovery Progress</h2>
        </div>
        <div className="range-switcher">
          {['7 days', '30 days', '90 days', 'Custom'].map((range) => (
            <button
              key={range}
              type="button"
              className={progressRange === range ? 'range-button active' : 'range-button'}
              onClick={() => setProgressRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Walking / mobility</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={rangeData}>
              <CartesianGrid stroke="#e8ded8" strokeDasharray="4 4" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Line type="monotone" dataKey="mobility" stroke="#cb6a5e" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Exercise completion</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={rangeData}>
              <CartesianGrid stroke="#e8ded8" strokeDasharray="4 4" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="exercise" fill="#6f8e6a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="timeline">
        <h3>Important notes timeline</h3>
        {timelineData.map((entry) => (
          <div key={`${entry.title}-${entry.date}`} className="timeline-item">
            <span>{entry.date}</span>
            <div>
              <strong>{entry.title}</strong>
              <p>{entry.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ProgressPage
