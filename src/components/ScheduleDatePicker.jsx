import { useEffect, useRef, useState } from 'react'
import { todayDate, monthStartDate, addMonths, buildCalendarMonths } from '../calendarUtils'

function parseISO(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Same red/amber/green day-density colouring as the Schedule page's calendar, so picking a
// date here shows exactly how full that day already is before you commit to it.
export default function ScheduleDatePicker({ value, onChange, allOpportunities, minDate, maxDate }) {
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => monthStartDate(parseISO(value) || todayDate()))
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClick = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    const handleKey = e => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const openPicker = () => {
    setViewMonth(monthStartDate(parseISO(value) || todayDate()))
    setOpen(true)
  }

  const month = buildCalendarMonths(allOpportunities || [], viewMonth, 1)[0]

  return (
    <div className="schedule-picker" ref={wrapRef}>
      <button type="button" className="schedule-picker-trigger" onClick={openPicker}>
        {value ? value : 'Choose a date'}
      </button>

      {open && (
        <div className="schedule-picker-popover" role="dialog" aria-label="Choose schedule date">
          <div className="schedule-picker-nav">
            <button type="button" className="show-more" onClick={() => setViewMonth(addMonths(viewMonth, -1))}>‹</button>
            <span>{month.monthLabel}</span>
            <button type="button" className="show-more" onClick={() => setViewMonth(addMonths(viewMonth, 1))}>›</button>
          </div>
          <div className="calendar-grid">
            {month.cells.map(cell => {
              if (cell.empty) return <div key={cell.key} className="calendar-cell empty" />
              const disabled = (minDate && cell.key < minDate) || (maxDate && cell.key > maxDate)
              return (
                <button
                  type="button"
                  key={cell.key}
                  disabled={disabled}
                  className={`calendar-cell ${cell.density} ${value === cell.key ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(cell.key)
                    setOpen(false)
                  }}
                >
                  <span className="calendar-day">{cell.day}</span>
                  <span className="calendar-count">{cell.count}</span>
                </button>
              )
            })}
          </div>
          <div className="calendar-legend">
            <span><i className="dot low" /> plenty of room</span>
            <span><i className="dot mid" /> filling up</span>
            <span><i className="dot high" /> at target</span>
          </div>
        </div>
      )}
    </div>
  )
}
