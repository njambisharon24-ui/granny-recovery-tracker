import { emergencyWarnings } from '../data'

function EmergencyPage() {
  return (
    <section className="panel emergency-panel">
      <div className="emergency-header">
        <div className="emergency-icon">⚠️</div>
        <div>
          <p className="eyebrow muted">Emergency guidance</p>
          <h2>Get Emergency Medical Help</h2>
        </div>
      </div>

      <p className="emergency-copy">
        Sudden new neurological symptoms after a previous stroke can require emergency medical attention.
        This app does not diagnose a stroke or other emergencies.
      </p>

      <div className="warning-grid">
        {emergencyWarnings.map((warning) => (
          <div key={warning} className="warning-card">
            <span>⚠</span>
            <strong>{warning}</strong>
          </div>
        ))}
      </div>

      <button type="button" className="emergency-button">Get Emergency Medical Help</button>
    </section>
  )
}

export default EmergencyPage
