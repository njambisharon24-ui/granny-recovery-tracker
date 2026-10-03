import { privacyDetails } from '../data'

function PrivacySecurityPage() {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow muted">Privacy-first design</p>
          <h2>Privacy & Security</h2>
        </div>
        <span className="section-tag">Sensitive data</span>
      </div>

      <div className="privacy-grid">
        {privacyDetails.map((block) => (
          <article key={block.title} className="privacy-card">
            <h3>{block.title}</h3>
            <ul>
              {block.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}

export default PrivacySecurityPage
