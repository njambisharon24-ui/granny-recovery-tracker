import { useEffect, useState } from 'react'
import { createExerciseEntry, getExerciseEntries } from '../api'
import { exerciseSessions } from '../data'

function groupExerciseEntries(entries) {
  const grouped = new Map()

  entries.forEach((entry) => {
    const label = entry.session_label || 'Morning session'
    if (!grouped.has(label)) {
      grouped.set(label, [])
    }

    grouped.get(label).push({
      id: entry.id,
      name: entry.name,
      description: entry.description || '',
      reps: entry.recommended || 'As advised',
      completed: Boolean(entry.completed),
      notes: entry.notes || '',
    })
  })

  return Array.from(grouped.entries()).map(([label, items]) => ({ label, items }))
}

function ExercisesPage({ token }) {
  const [exerciseData, setExerciseData] = useState(exerciseSessions)
  const [newExercise, setNewExercise] = useState({
    session: 'Morning session',
    name: '',
    description: '',
    reps: '',
    notes: '',
    completed: false,
  })

  useEffect(() => {
    if (!token) return

    getExerciseEntries(token)
      .then((items) => {
        if (items.length) {
          setExerciseData(groupExerciseEntries(items))
        }
      })
      .catch(() => {})
  }, [token])

  const totalExercises = exerciseData.reduce((sum, session) => sum + session.items.length, 0)
  const completedExercises = exerciseData.reduce(
    (sum, session) => sum + session.items.filter((item) => item.completed).length,
    0,
  )
  const exercisePercentage = totalExercises ? Math.round((completedExercises / totalExercises) * 100) : 0

  const handleExerciseToggle = (sessionIndex, exerciseIndex) => {
    setExerciseData((previous) =>
      previous.map((session, sessionPos) => {
        if (sessionPos !== sessionIndex) return session
        return {
          ...session,
          items: session.items.map((item, itemPos) =>
            itemPos === exerciseIndex ? { ...item, completed: !item.completed } : item,
          ),
        }
      }),
    )
  }

  const handleExerciseNoteChange = (sessionIndex, exerciseIndex, value) => {
    setExerciseData((previous) =>
      previous.map((session, sessionPos) => {
        if (sessionPos !== sessionIndex) return session
        return {
          ...session,
          items: session.items.map((item, itemPos) =>
            itemPos === exerciseIndex ? { ...item, notes: value } : item,
          ),
        }
      }),
    )
  }

  const handleAddExercise = async (event) => {
    event.preventDefault()
    if (!token || !newExercise.name.trim()) return

    const payload = {
      date: new Date().toISOString().slice(0, 10),
      session_label: newExercise.session,
      name: newExercise.name.trim(),
      description: newExercise.description.trim(),
      recommended: newExercise.reps.trim(),
      completed: newExercise.completed,
      notes: newExercise.notes.trim(),
    }

    const result = await createExerciseEntry(token, payload)
    const savedItem = result.entry
    setExerciseData((previous) => {
      const groupExists = previous.find((session) => session.label === savedItem.session_label)
      if (groupExists) {
        return previous.map((session) =>
          session.label === savedItem.session_label
            ? {
                ...session,
                items: [
                  ...session.items,
                  {
                    id: savedItem.id,
                    name: savedItem.name,
                    description: savedItem.description,
                    reps: savedItem.recommended,
                    completed: savedItem.completed,
                    notes: savedItem.notes,
                  },
                ],
              }
            : session,
        )
      }

      return [...previous, { label: savedItem.session_label, items: [{ ...savedItem, reps: savedItem.recommended }] }]
    })

    setNewExercise({ session: 'Morning session', name: '', description: '', reps: '', notes: '', completed: false })
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow muted">Rehabilitation support</p>
          <h2>Exercises</h2>
        </div>
        <div className="completion-badge">
          <strong>{exercisePercentage}%</strong>
          <span>today complete</span>
        </div>
      </div>

      <form className="note-form" onSubmit={handleAddExercise}>
        <div className="field-grid">
          <label className="stacked-field">
            <span>Session</span>
            <select value={newExercise.session} onChange={(event) => setNewExercise((previous) => ({ ...previous, session: event.target.value }))}>
              <option>Morning session</option>
              <option>Afternoon session</option>
              <option>Evening session</option>
            </select>
          </label>

          <label className="stacked-field">
            <span>Exercise name</span>
            <input value={newExercise.name} onChange={(event) => setNewExercise((previous) => ({ ...previous, name: event.target.value }))} placeholder="Example: Seated marching" />
          </label>
        </div>

        <div className="field-grid">
          <label className="stacked-field">
            <span>Description</span>
            <input value={newExercise.description} onChange={(event) => setNewExercise((previous) => ({ ...previous, description: event.target.value }))} placeholder="Optional description" />
          </label>

          <label className="stacked-field">
            <span>Recommended reps / duration</span>
            <input value={newExercise.reps} onChange={(event) => setNewExercise((previous) => ({ ...previous, reps: event.target.value }))} placeholder="Example: 10 reps each side" />
          </label>
        </div>

        <label className="stacked-field">
          <span>Notes</span>
          <textarea rows="2" value={newExercise.notes} onChange={(event) => setNewExercise((previous) => ({ ...previous, notes: event.target.value }))} placeholder="Add completion notes" />
        </label>

        <label className="stacked-field inline-field">
          <span>Completed</span>
          <input type="checkbox" checked={newExercise.completed} onChange={(event) => setNewExercise((previous) => ({ ...previous, completed: event.target.checked }))} />
        </label>

        <button type="submit" className="primary-button">Add exercise</button>
      </form>

      <div className="exercise-session-list">
        {exerciseData.map((session, sessionIndex) => (
          <div key={session.label} className="exercise-session">
            <div className="session-header">
              <h3>{session.label}</h3>
              <span>
                {session.items.filter((item) => item.completed).length}/{session.items.length} done
              </span>
            </div>

            {session.items.map((item, itemIndex) => (
              <article key={`${session.label}-${item.name}-${itemIndex}`} className="exercise-card">
                <div className="exercise-topline">
                  <div>
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                  </div>
                  <button
                    type="button"
                    className={item.completed ? 'toggle-button complete' : 'toggle-button'}
                    onClick={() => handleExerciseToggle(sessionIndex, itemIndex)}
                  >
                    {item.completed ? 'Completed' : 'Not completed'}
                  </button>
                </div>

                <div className="exercise-meta">
                  <span>{item.reps}</span>
                  <span>Recommended by healthcare professional</span>
                </div>

                <label className="stacked-field">
                  <span>Notes</span>
                  <textarea
                    rows="2"
                    value={item.notes}
                    onChange={(event) => handleExerciseNoteChange(sessionIndex, itemIndex, event.target.value)}
                  />
                </label>
              </article>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

export default ExercisesPage
