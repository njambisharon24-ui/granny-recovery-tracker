import { useState } from 'react'
import { createObservation } from '../api'
import { initialCheckIn, mobilityOptions, moodOptions } from '../data'

function DailyCheckInPage({ token }) {
  const [checkIn, setCheckIn] = useState(initialCheckIn)
  const [savedMessage, setSavedMessage] = useState('')
  const [error, setError] = useState('')

  const handleCheckInChange = (field, value) => {
    setCheckIn((previous) => ({ ...previous, [field]: value }))
  }

  const handleSaveCheckIn = async (event) => {
    event.preventDefault()

    try {
      const payload = {
        date: new Date().toISOString().slice(0, 10),
        mobility: checkIn.walking,
        speech: checkIn.speech,
        exercises_done: checkIn.exerciseCompleted,
        medication_taken: checkIn.medicationTaken,
        blood_pressure: checkIn.bloodPressure,
        notes: checkIn.notes,
      }

      await createObservation(token, payload)
      setSavedMessage('Today’s check-in has been saved. The caregiver notes are ready to review.')
      setError('')
    } catch (saveError) {
      setError(saveError.message || 'Unable to save the check-in right now.')
      setSavedMessage('')
    }
  }

  return (
    <section className="panel form-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow muted">Observation log</p>
          <h2>Daily Check-in</h2>
        </div>
        <span className="section-tag">Caregiver observation</span>
      </div>

      <form onSubmit={handleSaveCheckIn} className="checkin-form">
        <div className="field-block">
          <h3>Walking / mobility</h3>
          <div className="option-row">
            {mobilityOptions.map((option) => (
              <button
                type="button"
                key={option}
                className={checkIn.walking === option ? 'choice-button active' : 'choice-button'}
                onClick={() => handleCheckInChange('walking', option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="field-grid">
          <div className="field-block">
            <h3>Affected hand movement</h3>
            <div className="option-row compact">
              {mobilityOptions.map((option) => (
                <button
                  type="button"
                  key={`${option}-hand`}
                  className={checkIn.hand === option ? 'choice-button active' : 'choice-button'}
                  onClick={() => handleCheckInChange('hand', option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="field-block">
            <h3>Affected leg movement</h3>
            <div className="option-row compact">
              {mobilityOptions.map((option) => (
                <button
                  type="button"
                  key={`${option}-leg`}
                  className={checkIn.leg === option ? 'choice-button active' : 'choice-button'}
                  onClick={() => handleCheckInChange('leg', option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="field-grid">
          <div className="field-block">
            <h3>Speech / communication</h3>
            <div className="option-row compact">
              {mobilityOptions.map((option) => (
                <button
                  type="button"
                  key={`${option}-speech`}
                  className={checkIn.speech === option ? 'choice-button active' : 'choice-button'}
                  onClick={() => handleCheckInChange('speech', option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="field-block">
            <h3>Alertness</h3>
            <div className="option-row compact">
              {['Alert and responsive', 'Sleepy but responsive', 'Needs extra prompting'].map((option) => (
                <button
                  type="button"
                  key={option}
                  className={checkIn.alertness === option ? 'choice-button active' : 'choice-button'}
                  onClick={() => handleCheckInChange('alertness', option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="field-grid">
          <div className="field-block">
            <h3>Eating / swallowing</h3>
            <div className="option-row compact">
              {['Able to eat without difficulty', 'Needs slow pace', 'Needs support with meals'].map((option) => (
                <button
                  type="button"
                  key={option}
                  className={checkIn.swallowing === option ? 'choice-button active' : 'choice-button'}
                  onClick={() => handleCheckInChange('swallowing', option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="field-block">
            <h3>Mood</h3>
            <div className="option-row compact">
              {moodOptions.map((option) => (
                <button
                  type="button"
                  key={option}
                  className={checkIn.mood === option ? 'choice-button active' : 'choice-button'}
                  onClick={() => handleCheckInChange('mood', option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="field-grid small-grid">
          <label className="stacked-field">
            <span>Exercise completed</span>
            <input
              type="checkbox"
              checked={checkIn.exerciseCompleted}
              onChange={(event) => handleCheckInChange('exerciseCompleted', event.target.checked)}
            />
          </label>

          <label className="stacked-field">
            <span>Medication taken</span>
            <input
              type="checkbox"
              checked={checkIn.medicationTaken}
              onChange={(event) => handleCheckInChange('medicationTaken', event.target.checked)}
            />
          </label>

          <label className="stacked-field">
            <span>Blood pressure</span>
            <input
              type="text"
              value={checkIn.bloodPressure}
              onChange={(event) => handleCheckInChange('bloodPressure', event.target.value)}
            />
          </label>
        </div>

        <label className="stacked-field full-width">
          <span>Additional notes</span>
          <textarea
            rows="4"
            value={checkIn.notes}
            onChange={(event) => handleCheckInChange('notes', event.target.value)}
            placeholder="Record additional observations for today."
          />
        </label>

        <button type="submit" className="primary-button">Save Today’s Check-in</button>
        {savedMessage && <p className="save-status">{savedMessage}</p>}
        {error && <p className="login-error">{error}</p>}
      </form>
    </section>
  )
}

export default DailyCheckInPage
