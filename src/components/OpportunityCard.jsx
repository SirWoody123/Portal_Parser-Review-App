import { parseDateOnly } from '../calendarUtils'
import { computeHealth } from '../opportunityHealth'

function formatDate(raw) {
  if (!raw) return 'No deadline'
  const dt = parseDateOnly(raw)
  if (!dt) return raw
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
  return opportunity.company || opportunity.companyName || opportunity.organisation || 'ERIC Recommends'
}

// Derives the state from an opportunity's own status when the caller doesn't already know it
// (e.g. the Scouted list, where every card is either a draft or scheduled) — the Schedule day
// panel passes `state="sent"` explicitly instead, since a sent card is built from a publishLog
// entry rather than a live opportunity.
function deriveState(opportunity) {
  return (opportunity.status || '').toLowerCase().includes('schedule') ? 'scheduled' : 'draft'
}

export default function OpportunityCard({ opportunity, onEdit, onApprove, onDelete, primaryLabel, state, realPortalUrl }) {
  const cardState = state || deriveState(opportunity)
  const health = cardState !== 'sent' ? computeHealth(opportunity) : null
  const errorMessage = opportunity.errorNotes || opportunity.errorMessage || ''

  return (
    <article className={`card review-card${cardState === 'sent' ? ' is-sent' : ''}`}>
      <div className="card-image" role="presentation">
        <div className="overlay-row">
          <div className="left-icons" aria-hidden="true">
            <span className="tiny-circle eye">◉</span>
            <span className="tiny-circle pen">✎</span>
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="company-row">
          <span className="company-name">{companyName(opportunity)}</span>
          <span className="mail-icon" aria-hidden="true">✉</span>
        </div>

        <div className="title-row">
          <p className="card-category">{opportunity.opportunityType || 'Opportunity'}</p>
          {cardState === 'sent' ? (
            <span className="review-state state-sent">
              ✓ Sent{opportunity.schedulePost ? ` — ${opportunity.schedulePost}${opportunity.scheduleTime ? `, ${opportunity.scheduleTime}` : ''}` : ''}
            </span>
          ) : cardState === 'scheduled' ? (
            <span className="review-state state-scheduled">
              Scheduled — {opportunity.schedulePost || 'TBC'}{opportunity.scheduleTime ? `, ${opportunity.scheduleTime}` : ''}
            </span>
          ) : (
            <span className="review-state state-draft">In review{health ? ` · ${health.percent}%` : ''}</span>
          )}
        </div>

        <p className="card-title">{opportunity.title || 'Untitled'}</p>
        <p className="card-description">{shortText(opportunity.draftedContent || opportunity.summary)}</p>

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

        {errorMessage && <div className="card-error-strip">⚠ {errorMessage}</div>}

        <div className="card-actions">
          {cardState === 'sent' ? (
            realPortalUrl && (
              <a className="mini approve" href={realPortalUrl} target="_blank" rel="noreferrer">View on real portal →</a>
            )
          ) : (
            <>
              <button className="mini edit" onClick={onEdit}>Edit</button>
              <button className="mini approve" onClick={onApprove}>{primaryLabel || 'Approve'}</button>
              <button className="icon-action red" aria-label="Delete" title="Delete" onClick={onDelete}>×</button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
