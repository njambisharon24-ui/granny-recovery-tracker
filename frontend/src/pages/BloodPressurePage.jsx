import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { createBloodPressureEntry, getBloodPressureEntries } from '../api'
import { weeklyProgress } from '../data'

function BloodPressurePage({ token }) {
  const [chartData, setChartData] = useState(weeklyProgress)
  const [newReading, setNewReading] = useState({ systolic: '', diastolic: '', notes: '' })

  useEffect(() => {
    if (!token) return

    getBloodPressureEntries(token)
      .then((items) => {
        if (items.length) {
          const mapped = items.slice(-7).map((item) => ({
            name: item.date.slice(5),
            blood: item.systolic,
          }))
          setChartData(mapped)
        }
      })
      .catch(() => {})
  }, [token])

  const handleAddReading = async (event) => {
    event.preventDefault()
    if (!token || !newReading.systolic || !newReading.diastolic) return

    const payload = {
      date: new Date().toISOString().slice(0, 10),
      systolic: Number(newReading.systolic),
      diastolic: Number(newReading.diastolic),
      notes: newReading.notes.trim(),
    }

    const result = await createBloodPressureEntry(token, payload)
    const entry = result.entry
    setChartData((previous) => [
      ...previous,
      { name: entry.date.slice(5), blood: entry.systolic },
    ])
    setNewReading({ systolic: '', diastolic: '', notes: '' })
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow muted">Caregiver readings</p>
          <h2>Blood Pressure</h2>
        </div>
        <span className="section-tag">Recent readings</span>
      </div>

      <form className="note-form" onSubmit={handleAddReading}>
        <div className="field-grid">
          <label className="stacked-field">
            <span>Systolic</span>
            <input type="number" value={newReading.systolic} onChange={(event) => setNewReading((previous) => ({ ...previous, systolic: event.target.value }))} placeholder="120" />
          </label>

          <label className="stacked-field">
            <span>Diastolic</span>
            <input type="number" value={newReading.diastolic} onChange={(event) => setNewReading((previous) => ({ ...previous, diastolic: event.target.value }))} placeholder="80" />
          </label>
        </div>

        <label className="stacked-field">
          <span>Notes</span>
          <textarea rows="2" value={newReading.notes} onChange={(event) => setNewReading((previous) => ({ ...previous, notes: event.target.value }))} placeholder="Optional note" />
        </label>

        <button type="submit" className="primary-button">Add blood pressure reading</button>
      </form>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData}>
          <CartesianGrid stroke="#e8ded8" strokeDasharray="4 4" />
          <XAxis dataKey="name" />
          <YAxis domain={[100, 140]} />
          <Tooltip />
          <Bar dataKey="blood" fill="#4a6fa5" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mini-list">
        {chartData.slice(-4).map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="mini-item">
            <span>{entry.name}</span>
            <strong>{entry.blood}/80</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

export default BloodPressurePage
