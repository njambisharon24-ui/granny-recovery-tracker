import { useEffect, useState } from 'react'
import { createNoteEntry, getNotesEntries } from '../api'
import { noteEntries } from '../data'

function NotesPage({ token }) {
  const [notes, setNotes] = useState(noteEntries)
  const [newNote, setNewNote] = useState({ title: '', detail: '' })

  useEffect(() => {
    if (!token) return

    getNotesEntries(token)
      .then((items) => {
        const mapped = items
          .map((item) => ({
            title: item.title,
            date: item.date,
            detail: item.content,
          }))
          .slice(-5)
          .reverse()

        if (mapped.length) {
          setNotes(mapped)
        }
      })
      .catch(() => {})
  }, [token])

  const handleAddNote = async (event) => {
    event.preventDefault()
    if (!token || !newNote.title || !newNote.detail) return

    const payload = {
      date: new Date().toISOString().slice(0, 10),
      title: newNote.title,
      content: newNote.detail,
    }

    const result = await createNoteEntry(token, payload)
    setNotes((previous) => [{ title: result.entry.title, date: result.entry.date, detail: result.entry.content }, ...previous])
    setNewNote({ title: '', detail: '' })
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow muted">Caregiver updates</p>
          <h2>Notes</h2>
        </div>
        <span className="section-tag">Shared records</span>
      </div>

      <form onSubmit={handleAddNote} className="note-form">
        <label className="stacked-field">
          <span>Note title</span>
          <input
            type="text"
            value={newNote.title}
            onChange={(event) => setNewNote((previous) => ({ ...previous, title: event.target.value }))}
            placeholder="Example: Appetite improved"
          />
        </label>

        <label className="stacked-field">
          <span>Note details</span>
          <textarea
            rows="4"
            value={newNote.detail}
            onChange={(event) => setNewNote((previous) => ({ ...previous, detail: event.target.value }))}
            placeholder="Add a short note about today’s observations."
          />
        </label>

        <button type="submit" className="primary-button">Add note</button>
      </form>

      <div className="timeline">
        {notes.map((entry) => (
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

export default NotesPage
