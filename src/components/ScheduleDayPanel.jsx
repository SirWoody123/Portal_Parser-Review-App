import { useEffect, useRef } from 'react'
import OpportunityList from './OpportunityList'

// Inline panel below the Schedule calendar for whichever day is selected — replaces the old
// modal popup, since it now needs to show two sections (waiting to send, already sent) rather
// than a single flat list. Sits below a full 12-month grid, which can be 1900px+ tall — without
// an explicit scroll, clicking a day near the top of the calendar looked like nothing happened,
// since the panel updated far below the click with no visual cue to look down.
export default function ScheduleDayPanel({ selectedDate, waitingOpps, sentEntries, onEdit, onApprove, onDelete, getRealPortalUrl }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (selectedDate && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedDate])

  if (!selectedDate) return null

  return (
    <section className="schedule-day-panel" ref={panelRef}>
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
