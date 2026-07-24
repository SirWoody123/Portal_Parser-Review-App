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

function companyName(opportunity) {
  return opportunity.company || opportunity.companyName || opportunity.organisation || 'RicNic'
}

export default function OpportunityCard({ opportunity, onEdit, onApprove }) {
  return (
    <article className="card review-card">
      <div className="card-image" role="presentation">
        <div className="overlay-row">
          <div className="left-icons" aria-hidden="true">
            <span className="tiny-circle eye">◉</span>
            <span className="tiny-circle pen">✎</span>
          </div>
          <span className="badge status">AMBASSADOR</span>
        </div>
      </div>

      <div className="card-body">
        <div className="company-row">
          <span className="company-name">{companyName(opportunity)}</span>
          <span className="mail-icon" aria-hidden="true">✉</span>
        </div>

        <div className="title-row">
          <p className="card-category">{opportunity.opportunityType || 'Opportunity'}</p>
          <span className="review-state">In Review</span>
        </div>

        <p className="card-description">{shortText(opportunity.draftedContent)}</p>

        <div className="meta-grid">
          <div>
            <span className="meta-label">Deadline</span>
            <span>{formatDate(opportunity.applicationDeadline)}</span>
          </div>
          <div>
            <span className="meta-label">Location</span>
            <span>{opportunity.location || 'TBC'}</span>
          </div>
        </div>

        <div className="card-actions">
          <button className="mini edit" onClick={onEdit}>Edit</button>
          <button className="mini approve" onClick={onApprove}>Approve</button>
          <button className="icon-action red" aria-label="Reject">↶</button>
          <button className="icon-action green" aria-label="Restore">↷</button>
        </div>
      </div>
    </article>
  )
}
