function formatDate(raw) {
  if (!raw) return 'No deadline'
  const dt = new Date(raw)
  if (Number.isNaN(dt.getTime())) return raw
  return dt.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function shortText(text, max = 120) {
  if (!text) return 'No description provided yet.'
  return text.length > max ? `${text.slice(0, max)}...` : text
}

export default function OpportunityCard({ opportunity, isSelected, onSelect }) {
  return (
    <article className={`card review-card ${isSelected ? 'is-selected' : ''}`}>
      <button className="card-hit" onClick={onSelect} aria-label={`Review ${opportunity.title || 'opportunity'}`}>
        <div className="card-image" role="presentation">
          <div className="overlay-row">
            <span className="badge status">Scouted</span>
            {opportunity.remote && <span className="badge">Remote</span>}
            {opportunity.ukWide && <span className="badge">UK Wide</span>}
          </div>
        </div>

        <div className="card-body">
          <p className="card-category">{opportunity.opportunityType || 'Opportunity'}</p>
          <h3>{opportunity.title || 'Untitled opportunity'}</h3>
          <p className="card-description">{shortText(opportunity.draftedContent)}</p>

          <div className="meta-grid">
            <div>
              <span className="meta-label">Location</span>
              <span>{opportunity.location || 'TBC'}</span>
            </div>
            <div>
              <span className="meta-label">Deadline</span>
              <span>{formatDate(opportunity.applicationDeadline)}</span>
            </div>
          </div>
        </div>
      </button>
    </article>
  )
}
