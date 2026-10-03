import { useEffect, useState } from 'react'
import { createMedicationEntry, getMedicationEntries } from '../api'
import { medicationPlan } from '../data'

function MedicationPage({ token }) {
  const [plan, setPlan] = useState(medicationPlan)
  const [newEntry, setNewEntry] = useState({ name: '', scheduled_for: '', taken: false, notes: '' })

  useEffect(() => {
    if (!token) return

    getMedicationEntries(token)
      .then((items) => {
        if (items.length) {
          setPlan(
            items.map((item) => ({
              name: item.name,
              time: item.scheduled_for || 'Today',
              taken: Boolean(item.taken),
            })),
          )
        }
      })
      .catch(() => {})
  }, [token])

  const handleAddMedication = async (event) => {
    event.preventDefault()
    if (!token || !newEntry.name.trim()) return

    const payload = {
      date: new Date().toISOString().slice(0, 10),
      name: newEntry.name.trim(),
      scheduled_for: newEntry.scheduled_for.trim() || 'Today',
      taken: newEntry.taken,
      notes: newEntry.notes.trim(),
    }

    const result = await createMedicationEntry(token, payload)
    const saved = result.entry
    setPlan((previous) => [
      { name: saved.name, time: saved.scheduled_for || 'Today', taken: Boolean(saved.taken) },
      ...previous,
    ])
    setNewEntry({ name: '', scheduled_for: '', taken: false, notes: '' })
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow muted">Medication schedule</p>
          <h2>Medication</h2>
        </div>
        <span className="section-tag">Today</span>
      </div>

      <form className="note-form" onSubmit={handleAddMedication}>
        <div className="field-grid">
          <label className="stacked-field">
            <span>Medication name</span>
            <input value={newEntry.name} onChange={(event) => setNewEntry((previous) => ({ ...previous, name: event.target.value }))} placeholder="Example: Morning tablet" />
          </label>

          <label className="stacked-field">
            <span>Scheduled time</span>
            <input value={newEntry.scheduled_for} onChange={(event) => setNewEntry((previous) => ({ ...previous, scheduled_for: event.target.value }))} placeholder="8:00 AM" />
          </label>
        </div>

        <label className="stacked-field inline-field">
          <span>Taken</span>
          <input type="checkbox" checked={newEntry.taken} onChange={(event) => setNewEntry((previous) => ({ ...previous, taken: event.target.checked }))} />
        </label>

        <label className="stacked-field">
          <span>Notes</span>
          <textarea rows="2" value={newEntry.notes} onChange={(event) => setNewEntry((previous) => ({ ...previous, notes: event.target.value }))} placeholder="Optional notes" />
        </label>

        <button type="submit" className="primary-button">Add medication record</button>
      </form>

      <div className="medication-list">
        {plan.map((entry) => (
          <div key={`${entry.name}-${entry.time}`} className="medication-row">
            <div>
              <strong>{entry.name}</strong>
              <small>{entry.time}</small>
            </div>
            <span className={entry.taken ? 'status-chip ok' : 'status-chip warn'}>
              {entry.taken ? 'Taken' : 'Missing'}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default MedicationPage
