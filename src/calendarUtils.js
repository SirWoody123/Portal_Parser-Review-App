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
  // DD/MM/YYYY (what Claude's extraction outputs for eventDate) — handled explicitly rather
  // than falling through to the bare `new Date()` below, which treats slash-separated dates as
  // US-style MM/DD/YYYY: day-of-month <= 12 silently swaps month/day (5/9 read as May 9 instead
  // of 5 Sep), and day-of-month > 12 fails to parse at all and renders as blank.
  const dmyMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dmyMatch) {
    const [, dd, mm, yyyy] = dmyMatch
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd))
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

// The real portal's Event start/end time fields are native time pickers expecting strict
// 24-hour "HH:MM" — a bare "Invalid date" is what a copywriter sees if we ever send it
// something like "7:15am" (Claude's extraction used to produce that shape). Converts whatever
// was extracted or previously typed into that format; returns '' rather than guessing if it
// can't be parsed. Used by both the editor's display and the publish payload, so a value that
// only ever gets displayed (never re-typed) still gets fixed before publish.
export function normalizeTimeInput(raw) {
  if (!raw) return ''
  const trimmed = String(raw).trim()
  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*([ap]\.?m\.?)?$/i)
  if (!match) return ''
  let hours = Number(match[1])
  const minutes = match[2]
  const meridiem = (match[3] || '').toLowerCase().replace(/\./g, '')
  if (meridiem === 'pm' && hours !== 12) hours += 12
  if (meridiem === 'am' && hours === 12) hours = 0
  if (hours > 23) return ''
  return `${String(hours).padStart(2, '0')}:${minutes}`
}

// The UK is only ever on GMT (+0) or BST (+1) — checked at noon UTC on the given date to
// sidestep the 1am transition-day edge case (DST changes happen at 1am UK time).
function londonUtcOffsetMinutes(dateOnlyISO) {
  const noonUTC = new Date(`${dateOnlyISO}T12:00:00.000Z`)
  const londonHour = Number(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', hour: 'numeric', hour12: false,
  }).format(noonUTC))
  return londonHour === 13 ? 60 : 0
}

// Combines a date with a "HH:MM" Europe/London wall-clock time into a full ISO instant.
// Live-verified this is what the real portal's Event start/end time fields actually need — a
// bare "HH:MM" string renders as "Invalid date" there even when syntactically valid 24-hour
// (confirmed on a real published row). Watching the real portal's own time picker write a
// value directly showed it always stores a *full* timestamp — using today's date with
// whichever hour/minute was picked — so only the time-of-day portion is actually meaningful to
// it, but it still needs a genuinely parseable full instant, not a bare time. Takes a raw date
// (any format parseDateOnly() accepts) rather than a pre-normalized one, since the client only
// ever has the editor's own state to work from.
export function combineLondonDateAndTime(dateRaw, timeRaw) {
  const date = parseDateOnly(dateRaw)
  const time = normalizeTimeInput(timeRaw)
  if (!date || !time) return ''
  const dateOnlyISO = toISODate(date)
  const [hh, mm] = time.split(':').map(Number)
  const offsetMinutes = londonUtcOffsetMinutes(dateOnlyISO)
  const instant = new Date(`${dateOnlyISO}T00:00:00.000Z`)
  instant.setUTCMinutes(instant.getUTCMinutes() + hh * 60 + mm - offsetMinutes)
  return instant.toISOString()
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
