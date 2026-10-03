import { settingsOptions } from '../data'

function SettingsPage() {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow muted">Caregiver preferences</p>
          <h2>Settings</h2>
        </div>
        <span className="section-tag">Accessibility</span>
      </div>

      <div className="settings-list">
        {settingsOptions.map((setting) => (
          <div key={setting} className="setting-row">
            <span>{setting}</span>
            <button type="button" className="toggle-control">On</button>
          </div>
        ))}
      </div>
    </section>
  )
}

export default SettingsPage
