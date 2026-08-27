import OpportunityList from './OpportunityList'

// Inline panel below the Schedule calendar for whichever day is selected — replaces the old
// modal popup, since it now needs to show two sections (waiting to send, already sent) rather
// than a single flat list.
export default function ScheduleDayPanel({ selectedDate, waitingOpps, sentEntries, onEdit, onApprove, onDelete, getRealPortalUrl }) {
  if (!selectedDate) return null

  return (
    <section className="schedule-day-panel">
      <h3 className="schedule-day-heading">{selectedDate}</h3>

      <div className="schedule-day-section">
        <h4 className="schedule-day-subheading">Waiting to send ({waitingOpps.length})</h4>
        {waitingOpps.length === 0 ? (
          <p className="empty">Nothing scheduled for this day.</p>
        ) : (
          <OpportunityList
            opportunities={waitingOpps}
            onEdit={onEdit}
            onApprove={onApprove}
            onDelete={onDelete}
            primaryLabel="Publish now"
            state="scheduled"
          />
        )}
      </div>

      {sentEntries.length > 0 && (
        <div className="schedule-day-section">
          <h4 className="schedule-day-subheading">Sent ({sentEntries.length})</h4>
          <OpportunityList
            opportunities={sentEntries}
            state="sent"
            getRealPortalUrl={getRealPortalUrl}
          />
        </div>
      )}
    </section>
  )
}
