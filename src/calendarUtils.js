// Shared by the Schedule page's calendar and the editor's schedule-date picker, so both show
// identical day-density colouring instead of drifting apart.

export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayDate() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

// Parses a date that may be a full ISO string ("2026-08-19") or a bare, year-less string as
// scraped/extracted ("19 Aug") — JS's Date constructor defaults year-less strings to 2001,
// which every consumer needs corrected the same way or a scraped deadline silently reads as
// permanently overdue (and, if left uncorrected all the way to publish, gets sent to the real
// portal as literally the year 2001). Used by card display, the editor's date field, and the
// publish payload — one implementation so none of them can drift out of sync with the others.
export function parseDateOnly(raw) {
  if (!raw) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  const dt = new Date(raw)
  if (Number.isNaN(dt.getTime())) return null

  if (dt.getFullYear() === 2001 && !/2001/.test(raw)) {
    const today = todayDate()
    const thisYear = new Date(today.getFullYear(), dt.getMonth(), dt.getDate())
    return thisYear < today ? new Date(today.getFullYear() + 1, dt.getMonth(), dt.getDate()) : thisYear
  }

  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
}

export function monthStartDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

// Matches the schedule calendar's "low" density threshold — a day under this is considered
// to still have room before we start pushing opportunities further out.
export const DAILY_SCHEDULE_TARGET = 20

export function buildScheduleCounts(rows) {
  return rows.reduce((acc, opp) => {
    if ((opp.status || '').toLowerCase() !== 'scheduled') return acc
    if (!opp.schedulePost) return acc
    acc[opp.schedulePost] = (acc[opp.schedulePost] || 0) + 1
    return acc
  }, {})
}

export function densityFor(count) {
  if (count >= 30) return 'high'
  if (count >= DAILY_SCHEDULE_TARGET) return 'mid'
  return 'low'
}

export function buildCalendarMonths(rows, startMonth, span = 12) {
  const counts = buildScheduleCounts(rows)
  const months = []

  for (let index = 0; index < span; index += 1) {
    const base = addMonths(startMonth, index)
    const start = monthStartDate(base)
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0)
    const cells = []

    for (let i = 0; i < start.getDay(); i += 1) {
      cells.push({ empty: true, key: `${toISODate(start)}-empty-start-${i}` })
    }

    for (let day = 1; day <= end.getDate(); day += 1) {
      const dt = new Date(base.getFullYear(), base.getMonth(), day)
      const key = toISODate(dt)
      const count = counts[key] || 0
      cells.push({
        key,
        day,
        count,
        density: densityFor(count),
        empty: false
      })
    }

    months.push({
      key: toISODate(start),
      monthLabel: base.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      cells
    })
  }

  return months
}
