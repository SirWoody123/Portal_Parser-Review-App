import { useState, useEffect, useMemo, useRef } from 'react'
import OpportunityList from './components/OpportunityList'
import ReviewDetailPanel from './components/ReviewDetailPanel'
import {
  toISODate,
  todayDate,
  monthStartDate,
  addMonths,
  DAILY_SCHEDULE_TARGET,
  buildScheduleCounts,
  buildCalendarMonths
} from './calendarUtils'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const ITEMS_PER_BATCH = 8
const PAGES = ['Scouted', 'Published', 'Schedule', 'Log', 'Errors']
const REAL_PORTAL_CONTENT_URL = 'https://meet-eric.com/content/list'

function parseDateOnly(raw) {
  if (!raw) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  const dt = new Date(raw)
  if (Number.isNaN(dt.getTime())) return null

  // JS's Date constructor defaults to year 2001 for strings with no year (e.g. "26 Sep"),
  // which reads as permanently overdue. Treat that as "year not specified" and assume the
  // nearest future occurrence of that month/day instead.
  if (dt.getFullYear() === 2001 && !/2001/.test(raw)) {
    const today = todayDate()
    const thisYear = new Date(today.getFullYear(), dt.getMonth(), dt.getDate())
    return thisYear < today ? new Date(today.getFullYear() + 1, dt.getMonth(), dt.getDate()) : thisYear
  }

  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
}

function dayDiff(a, b) {
  const ms = 1000 * 60 * 60 * 24
  return Math.round((a.getTime() - b.getTime()) / ms)
}

function scheduleRule(deadlineRaw) {
  const today = todayDate()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const deadline = parseDateOnly(deadlineRaw)

  if (!deadline) {
    return {
      kind: 'free',
      minDate: toISODate(today),
      maxDate: '',
      note: 'No deadline found, schedule date is flexible.'
    }
  }

  const diff = dayDiff(deadline, today)
  if (diff <= 0) {
    return {
      kind: 'today-only',
      minDate: toISODate(today),
      maxDate: toISODate(today),
      note: 'Deadline is today or overdue, schedule must be today.'
    }
  }

  if (diff === 1) {
    return {
      kind: 'today-or-tomorrow',
      minDate: toISODate(today),
      maxDate: toISODate(tomorrow),
      note: 'Deadline is tomorrow, schedule must be today or tomorrow.'
    }
  }

  return {
    kind: 'free',
    minDate: toISODate(today),
    maxDate: '',
    note: 'Deadline is beyond tomorrow, schedule date is flexible.'
  }
}

// Groups the Scouted queue by how soon it needs attention — an unparseable/missing deadline
// is treated as urgent rather than flexible, since "unclear" needs a human look, not a default.
function urgencyBucket(deadlineRaw) {
  const deadline = parseDateOnly(deadlineRaw)
  if (!deadline) return 'urgent'
  const diff = dayDiff(deadline, todayDate())
  if (diff <= 3) return 'urgent'
  if (diff <= 14) return 'soon'
  return 'later'
}

const URGENCY_SECTIONS = [
  { key: 'urgent', label: 'Urgent' },
  { key: 'soon', label: 'Within 2 weeks' },
  { key: 'later', label: 'Months of time' }
]

async function loadScheduledMap() {
  try {
    const res = await fetch(`${API_BASE}/schedule-state`)
    if (!res.ok) return {}
    const data = await res.json()
    return data.scheduleState && typeof data.scheduleState === 'object' ? data.scheduleState : {}
  } catch {
    return {}
  }
}

async function saveScheduledMap(map) {
  try {
    await fetch(`${API_BASE}/schedule-state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduleState: map })
    })
  } catch {
    // Best-effort — the opportunities state already reflects the change locally either way.
  }
}

function computeSuggestedScheduleDate(opportunity, allRows) {
  const today = todayDate()
  const counts = buildScheduleCounts(allRows)
  const rule = scheduleRule(opportunity.applicationDeadline)

  if (rule.kind === 'today-only') {
    return rule.minDate
  }

  if (rule.kind === 'today-or-tomorrow') {
    const dayA = rule.minDate
    const dayB = rule.maxDate
    const scoreA = counts[dayA] || 0
    const scoreB = counts[dayB] || 0
    return scoreA <= scoreB ? dayA : dayB
  }

  const deadline = parseDateOnly(opportunity.applicationDeadline)
  const start = new Date(today)
  const end = deadline && dayDiff(deadline, today) > 1
    ? deadline
    : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)

  // Fill near-term days up to the daily target before spreading further out — a distant
  // deadline shouldn't mean the next week goes unscheduled just because some day months away
  // happens to be emptier. Only once every day in range is already at/above target do we fall
  // back to picking whichever day is least loaded.
  let cursor = new Date(start)
  let bestDate = toISODate(start)
  let bestScore = Number.POSITIVE_INFINITY

  while (cursor <= end) {
    const key = toISODate(cursor)
    const load = counts[key] || 0
    if (load < DAILY_SCHEDULE_TARGET) {
      return key
    }
    const distance = dayDiff(cursor, today)
    const score = load * 100 + distance
    if (score < bestScore) {
      bestScore = score
      bestDate = key
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return bestDate
}

function validateScheduleDate(deadlineRaw, scheduleRaw) {
  if (!scheduleRaw) {
    return { ok: true, message: '' }
  }

  const rule = scheduleRule(deadlineRaw)
  if (rule.kind === 'free') return { ok: true, message: '' }
  if (rule.kind === 'today-only' && scheduleRaw !== rule.minDate) {
    return { ok: false, message: 'Deadline is today. Schedule date must be today.' }
  }
  if (rule.kind === 'today-or-tomorrow') {
    if (scheduleRaw !== rule.minDate && scheduleRaw !== rule.maxDate) {
      return { ok: false, message: 'Deadline is tomorrow. Schedule date must be today or tomorrow.' }
    }
  }
  return { ok: true, message: '' }
}

function searchMatch(opp, term) {
  if (!term) return true
  const haystack = [
    opp.title,
    opp.opportunityType,
    opp.draftedContent,
    opp.location,
    opp.salary,
    opp.link
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(term.toLowerCase())
}

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value !== 'string') return []
  return value.split(',').map(item => item.trim()).filter(Boolean)
}

function toBool(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === 'yes' || normalized === 'true' || normalized === '1'
  }
  return Boolean(value)
}

function parseDemographicsBlock(raw) {
  const result = {
    age: [],
    genderSexualPreference: [],
    ethnicity: [],
    disability: [],
    lowerSocioEconomicBackground: []
  }
  if (!raw || typeof raw !== 'string') return result
  const lines = raw.split('\n').map(line => line.trim()).filter(Boolean)
  for (const line of lines) {
    const [k, ...rest] = line.split(':')
    if (!k || rest.length === 0) continue
    const key = k.trim().toLowerCase()
    const val = rest.join(':').trim()
    if (key === 'age') result.age = toArray(val)
    if (key === 'gender' || key === 'gender & sexual preference') result.genderSexualPreference = toArray(val)
    if (key === 'ethnicity') result.ethnicity = toArray(val)
    if (key === 'disability') result.disability = toArray(val)
    if (key === 'economic background' || key === 'lower socio economic background') {
      result.lowerSocioEconomicBackground = toArray(val)
    }
  }
  return result
}

function normalizeDateForBackend(raw) {
  if (!raw) return ''
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(raw)) return raw
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return `${raw}T00:00:00.000Z`
  const dmyMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dmyMatch) {
    const dd = String(Number(dmyMatch[1])).padStart(2, '0')
    const mm = String(Number(dmyMatch[2])).padStart(2, '0')
    const yyyy = dmyMatch[3]
    return `${yyyy}-${mm}-${dd}T00:00:00.000Z`
  }
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return ''
  return `${toISODate(parsed)}T00:00:00.000Z`
}

function buildPublishPayload(opp) {
  const fallbackDemo = parseDemographicsBlock(opp.demographics)
  const currentDemo = opp.demographic || {}
  return {
    ...opp,
    companyID: opp.companyID || opp.companyId || '',
    applicationDeadline: normalizeDateForBackend(opp.applicationDeadline),
    // transformData() reads publishedAt, not publishDate — keep both so nothing downstream breaks.
    publishDate: normalizeDateForBackend(opp.publishDate),
    publishedAt: normalizeDateForBackend(opp.publishDate),
    // transformData() reads description, not draftedContent — the copywriter's edited text lives in draftedContent.
    description: opp.draftedContent || opp.description || '',
    schedulePost: opp.schedulePost || '',
    remote: toBool(opp.remote),
    ukWide: toBool(opp.ukWide),
    // Publishing means "send it live" in this pipeline — workflow labels like "Ready for
    // Review"/"scheduled" aren't statuses the real portal's queries match on.
    status: 'live',
    eventDate: normalizeDateForBackend(opp.eventDate),
    // transformData() also has legacy top-level eventName/eventTime/eventTimeEnd fields
    // alongside the richer eventDetails object — derive them instead of asking the
    // copywriter to fill the same info in twice under different labels.
    ...(opp.eventDetails ? {
      eventName: opp.eventDetails.eventTitle || opp.title || '',
      eventTime: opp.eventDetails.eventStartTime || '',
      eventTimeEnd: opp.eventDetails.eventEndTime || ''
    } : {}),
    demographic: {
      age: currentDemo.age || fallbackDemo.age,
      genderSexualPreference: currentDemo.genderSexualPreference || fallbackDemo.genderSexualPreference,
      ethnicity: currentDemo.ethnicity || fallbackDemo.ethnicity,
      disability: currentDemo.disability || fallbackDemo.disability,
      lowerSocioEconomicBackground: currentDemo.lowerSocioEconomicBackground || fallbackDemo.lowerSocioEconomicBackground,
      // industryTags is what the editor's Industry tag picker actually writes to.
      industry: (opp.industryTags && opp.industryTags.length ? opp.industryTags : null) || currentDemo.industry || toArray(opp.industry)
    }
  }
}

function isDescriptionUsable(description) {
  if (!description) return false
  const trimmed = description.trim()
  if (trimmed.length < 20) return false
  // Claude's extraction prompt writes "Unclear" when it can't determine a real description —
  // correct behaviour for it, but never something that should reach a real user as-is.
  if (/unclear/i.test(trimmed)) return false
  return true
}

function validatePublishPayload(opp) {
  const errors = []
  if (!opp.title) errors.push('Title is required.')
  if (!opp.opportunityType) errors.push('Opportunity type is required.')
  if (!opp.applicationDeadline) errors.push('Application deadline is missing or invalid.')
  if (!isDescriptionUsable(opp.description)) {
    errors.push('Description looks incomplete or unclear — write a proper summary before publishing.')
  }
  return errors
}

function App() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  // Each entry: { id, message, rowIndex, timestamp }. rowIndex lets the Errors page jump
  // straight to the opportunity a failure was about, instead of leaving you to guess.
  const [errorLog, setErrorLog] = useState([])
  const [toast, setToast] = useState(null)
  const [publishLog, setPublishLog] = useState([])
  const [publishLogLoading, setPublishLogLoading] = useState(false)
  const [editing, setEditing] = useState(null)
  const [page, setPage] = useState('Scouted')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_BATCH)
  const [calendarStart, setCalendarStart] = useState(() => {
    const now = todayDate()
    return toISODate(new Date(now.getFullYear(), now.getMonth(), 1))
  })
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('')
  const dueProcessingRef = useRef(false)

  const pushError = (message, rowIndex = null) => {
    setErrorLog(prev => [{ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, message, rowIndex, timestamp: new Date().toISOString() }, ...prev])
  }
  const dismissError = id => {
    setErrorLog(prev => prev.filter(e => e.id !== id))
  }
  const showToast = message => {
    setToast({ id: Date.now(), message })
  }

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (page !== 'Log') return
    let cancelled = false
    setPublishLogLoading(true)
    fetch(`${API_BASE}/publish-log`)
      .then(res => res.ok ? res.json() : { entries: [] })
      .then(data => { if (!cancelled) setPublishLog(data.entries || []) })
      .catch(() => { if (!cancelled) setPublishLog([]) })
      .finally(() => { if (!cancelled) setPublishLogLoading(false) })
    return () => { cancelled = true }
  }, [page])

  useEffect(() => {
    fetchOpportunities()
  }, [])

  const fetchOpportunities = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/queue-review`)
      if (!res.ok) throw new Error('Failed to fetch opportunities')
      const data = await res.json()
      const rows = data.opportunities || []
      const scheduledMap = await loadScheduledMap()
      const hydrated = rows.map(row => {
        const localScheduled = scheduledMap[row.rowIndex]
        return localScheduled ? { ...row, ...localScheduled } : row
      })
      setOpportunities(hydrated)
    } catch (err) {
      pushError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Returns { ok } so callers (auto-publish, "Publish now") know whether a schedule-state
  // entry should actually be cleared — a failed publish must not look like a successful one.
  const handlePublish = async (rowIndex, editedOpp) => {
    try {
      const payload = buildPublishPayload(editedOpp)
      const errors = validatePublishPayload(payload)
      if (errors.length > 0) {
        pushError(errors.join(' '), rowIndex)
        return { ok: false, message: errors.join(' ') }
      }

      const res = await fetch(`${API_BASE}/update-queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex, editedOpportunity: payload })
      })
      if (!res.ok) throw new Error('Failed to publish')
      setOpportunities(prev => {
        const next = prev.filter(o => o.rowIndex !== rowIndex)
        if (editing?.rowIndex === rowIndex) {
          setEditing(null)
        }
        return next
      })
      showToast(`"${payload.title || 'Opportunity'}" was sent to the real portal.`)
      return { ok: true }
    } catch (err) {
      pushError(err.message, rowIndex)
      return { ok: false, message: err.message }
    }
  }

  const handleSaveDraft = async (rowIndex, updatedFields) => {
    const check = validateScheduleDate(updatedFields.applicationDeadline, updatedFields.schedulePost)
    if (!check.ok) {
      pushError(check.message, rowIndex)
      return { ok: false, message: check.message }
    }

    let scheduleEntry = null

    setOpportunities(prev => {
      const next = prev.map(opp => {
        if (opp.rowIndex !== rowIndex) return opp
        const merged = { ...opp, ...updatedFields }
        if (merged.schedulePost) merged.status = 'scheduled'
        return merged
      })

      // Store the full edited opportunity, not just a handful of fields — this is the only
      // place copywriter edits (description, banner, event details, salary, ...) survive a
      // page reload or a different browser/session. A narrower whitelist here previously meant
      // edits only lived in this tab's React state and silently reverted to the raw
      // Claude-drafted content the next time anyone (or the publish-when-due scheduler) loaded
      // this row from scratch.
      const edited = next.find(opp => opp.rowIndex === rowIndex)
      scheduleEntry = edited?.schedulePost ? edited : null

      return next
    })

    const scheduledMap = await loadScheduledMap()
    if (scheduleEntry) {
      scheduledMap[rowIndex] = scheduleEntry
    } else {
      delete scheduledMap[rowIndex]
    }
    await saveScheduledMap(scheduledMap)

    return { ok: true }
  }

  const publishScheduledNow = async opp => {
    const result = await handlePublish(opp.rowIndex, opp)
    if (!result.ok) return
    const scheduledMap = await loadScheduledMap()
    delete scheduledMap[opp.rowIndex]
    await saveScheduledMap(scheduledMap)
  }

  useEffect(() => {
    if (dueProcessingRef.current) return
    const due = opportunities.filter(opp => {
      if ((opp.status || '').toLowerCase() !== 'scheduled') return false
      if (!opp.schedulePost) return false
      const scheduleDt = parseDateOnly(opp.schedulePost)
      if (!scheduleDt) return false
      return dayDiff(scheduleDt, todayDate()) <= 0
    })

    if (due.length === 0) return
    dueProcessingRef.current = true

    ;(async () => {
      try {
        for (const opp of due) {
          const result = await handlePublish(opp.rowIndex, opp)
          if (!result.ok) continue
          const scheduledMap = await loadScheduledMap()
          delete scheduledMap[opp.rowIndex]
          await saveScheduledMap(scheduledMap)
        }
      } finally {
        dueProcessingRef.current = false
      }
    })()
  }, [opportunities])

  const types = [
    'all',
    ...new Set(opportunities.map(o => o.opportunityType).filter(Boolean))
  ]

  const pageFiltered = opportunities.filter(opp => {
    const status = (opp.status || opp.originalStatus || '').toLowerCase()
    if (page === 'Published') return status.includes('published')
    if (page === 'Schedule') return status.includes('schedule') || status.includes('scheduled')
    return !status || status.includes('scouted') || status.includes('review') || status.includes('ready')
  })

  const filtered = pageFiltered.filter(opp => {
    const matchesType = typeFilter === 'all' || opp.opportunityType === typeFilter
    return matchesType && searchMatch(opp, search)
  })

  const visible = filtered.slice(0, visibleCount)

  const scoutedGroups = useMemo(() => {
    if (page !== 'Scouted') return null
    const groups = { urgent: [], soon: [], later: [] }
    filtered.forEach(opp => {
      groups[urgencyBucket(opp.applicationDeadline)].push(opp)
    })
    return groups
  }, [page, filtered])

  const calendarMonths = useMemo(() => {
    const start = parseDateOnly(calendarStart) || monthStartDate(todayDate())
    return buildCalendarMonths(opportunities, monthStartDate(start), 12)
  }, [opportunities, calendarStart])

  const scheduledByDate = useMemo(
    () => opportunities.filter(opp => (opp.status || '').toLowerCase() === 'scheduled' && opp.schedulePost),
    [opportunities]
  )

  const selectedDayOpps = useMemo(() => {
    if (!selectedCalendarDate) return []
    return scheduledByDate.filter(opp => opp.schedulePost === selectedCalendarDate)
  }, [scheduledByDate, selectedCalendarDate])

  const jumpCalendar = months => {
    const start = parseDateOnly(calendarStart) || monthStartDate(todayDate())
    setCalendarStart(toISODate(addMonths(start, months)))
  }
  const editingSuggestion = useMemo(() => {
    if (!editing) return ''
    if (editing.schedulePost) return editing.schedulePost
    return computeSuggestedScheduleDate(editing, opportunities)
  }, [editing, opportunities])
  const editingRule = useMemo(() => scheduleRule(editing?.applicationDeadline), [editing])

  const hasMore = filtered.length > visible.length

  useEffect(() => {
    setVisibleCount(ITEMS_PER_BATCH)
  }, [search, typeFilter, page])

  return (
    <div className="portal-shell">
      <main className="portal-content-wrap portal-content-only">
        <section className="portal-content review-feed">
          <header className="review-top-row">
            <div className="page-tabs">
              {PAGES.map(label => (
                <button
                  key={label}
                  className={`page-tab ${page === label ? 'is-active' : ''}`}
                  onClick={() => setPage(label)}
                >
                  {label}
                  {label === 'Errors' && errorLog.length > 0 && (
                    <span className="page-tab-badge">{errorLog.length}</span>
                  )}
                </button>
              ))}
            </div>

            {page !== 'Log' && page !== 'Errors' && (
              <div className="filter-row compact">
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} aria-label="Filter by type">
                  {types.map(type => (
                    <option key={type} value={type}>{type === 'all' ? 'Content type' : type}</option>
                  ))}
                </select>
                <div className="search-wrap">
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search...."
                    aria-label="Search opportunities"
                  />
                  <button className="search-button" aria-label="Search">⌕</button>
                </div>
              </div>
            )}
          </header>

          {page === 'Log' ? (
            <div className="queue-count">{publishLog.length} sent to the real portal</div>
          ) : page === 'Errors' ? (
            <div className="queue-count">{errorLog.length} error{errorLog.length === 1 ? '' : 's'}</div>
          ) : (
            <div className="queue-count">{filtered.length} in {page.toLowerCase()}</div>
          )}

          {errorLog.length > 0 && page !== 'Errors' && (
            <div className="error dismissible">
              <span>{errorLog[0].message}</span>
              <button className="dismiss-error" onClick={() => dismissError(errorLog[0].id)} aria-label="Dismiss">×</button>
            </div>
          )}

          {page === 'Log' ? (
            publishLogLoading ? (
              <div className="loading spinner-wrap" role="status" aria-live="polite"><span className="spinner" /></div>
            ) : publishLog.length === 0 ? (
              <div className="empty">Nothing has been sent to the real portal yet.</div>
            ) : (
              <div className="publish-log-list">
                {publishLog.map(entry => (
                  <div key={entry.id} className="publish-log-row">
                    <div>
                      <div className="publish-log-title">{entry.title || 'Untitled'}</div>
                      <div className="publish-log-meta">
                        {entry.opportunityType || 'Opportunity'} · {new Date(entry.publishedAt).toLocaleString('en-GB')} · {entry.via === 'scheduler' ? 'auto (scheduled)' : 'manual'}
                      </div>
                    </div>
                    <a href={REAL_PORTAL_CONTENT_URL} target="_blank" rel="noreferrer" className="publish-log-link">Review on real portal →</a>
                  </div>
                ))}
              </div>
            )
          ) : page === 'Errors' ? (
            errorLog.length === 0 ? (
              <div className="empty">No errors — nice.</div>
            ) : (
              <div className="publish-log-list">
                {errorLog.map(entry => {
                  const relatedOpp = entry.rowIndex ? opportunities.find(o => o.rowIndex === entry.rowIndex) : null
                  return (
                    <div key={entry.id} className="publish-log-row">
                      <div>
                        <div className="publish-log-title">{entry.message}</div>
                        <div className="publish-log-meta">{new Date(entry.timestamp).toLocaleString('en-GB')}</div>
                      </div>
                      <div className="error-row-actions">
                        {relatedOpp ? (
                          <button className="publish-log-link as-button" onClick={() => setEditing(relatedOpp)}>View opportunity →</button>
                        ) : entry.rowIndex ? (
                          <span className="field-help">No longer available</span>
                        ) : null}
                        <button className="dismiss-error" onClick={() => dismissError(entry.id)} aria-label="Dismiss">×</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : loading ? (
            <div className="loading spinner-wrap" role="status" aria-live="polite">
              <span className="spinner" />
            </div>
          ) : page === 'Schedule' ? null : filtered.length === 0 ? (
            <div className="empty">No opportunities in {page}.</div>
          ) : page === 'Scouted' ? (
            <>
              {URGENCY_SECTIONS.map(section => {
                const items = scoutedGroups[section.key]
                if (items.length === 0) return null
                return (
                  <section key={section.key} className="urgency-section">
                    <h3 className={`urgency-heading urgency-${section.key}`}>
                      {section.label} <span className="urgency-count">({items.length})</span>
                    </h3>
                    <OpportunityList
                      opportunities={items}
                      onEdit={opp => setEditing(opp)}
                      onApprove={opp => handlePublish(opp.rowIndex, opp)}
                      primaryLabel="Approve"
                    />
                  </section>
                )
              })}
            </>
          ) : (
            <>
              <OpportunityList
                opportunities={visible}
                onEdit={opp => setEditing(opp)}
                onApprove={opp => {
                  if (page === 'Schedule') {
                    publishScheduledNow(opp)
                  } else {
                    handlePublish(opp.rowIndex, opp)
                  }
                }}
                primaryLabel={page === 'Schedule' ? 'Publish now' : 'Approve'}
              />
              {hasMore && (
                <div className="show-more-row">
                  <button className="show-more" onClick={() => setVisibleCount(v => v + ITEMS_PER_BATCH)}>
                    Show more
                  </button>
                </div>
              )}
            </>
          )}

          {page === 'Schedule' && (
            <section className="schedule-calendar">
              <div className="calendar-toolbar">
                <div className="calendar-header">Schedule Calendar: 12 month view</div>
                <div className="calendar-nav">
                  <button className="show-more" onClick={() => jumpCalendar(-12)}>Previous 12</button>
                  <button className="show-more" onClick={() => jumpCalendar(12)}>Next 12</button>
                </div>
              </div>

              <div className="calendar-months-grid">
                {calendarMonths.map(month => (
                  <article key={month.key} className="calendar-month-card">
                    <div className="month-label">{month.monthLabel}</div>
                    <div className="calendar-grid">
                      {month.cells.map(cell =>
                        cell.empty ? (
                          <div key={cell.key} className="calendar-cell empty" />
                        ) : (
                          <button
                            key={cell.key}
                            className={`calendar-cell ${cell.density} ${selectedCalendarDate === cell.key ? 'selected' : ''}`}
                            onClick={() => setSelectedCalendarDate(cell.key)}
                          >
                            <span className="calendar-day">{cell.day}</span>
                            <span className="calendar-count">{cell.count}</span>
                          </button>
                        )
                      )}
                    </div>
                  </article>
                ))}
              </div>

              <div className="calendar-legend">
                <span><i className="dot low" /> below 20</span>
                <span><i className="dot mid" /> 20 to 29</span>
                <span><i className="dot high" /> 30 and above</span>
              </div>
            </section>
          )}
        </section>
      </main>

      {selectedCalendarDate && (
        <div className="day-popup-overlay" role="dialog" aria-modal="true" aria-label="Scheduled opportunities" onClick={() => setSelectedCalendarDate('')}>
          <div className="day-popup-surface" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedCalendarDate('')} aria-label="Close">×</button>
            <div className="day-schedule-title">
              Scheduled for {selectedCalendarDate} ({selectedDayOpps.length})
            </div>
            {selectedDayOpps.length === 0 ? (
              <div className="empty">No opportunities scheduled on this day.</div>
            ) : (
              <div className="day-schedule-list">
                {selectedDayOpps.map(opp => (
                  <article key={`day-${opp.rowIndex}`} className="day-schedule-item">
                    <div>
                      <div className="day-item-title">{opp.title || 'Untitled opportunity'}</div>
                      <div className="day-item-meta">{opp.opportunityType || 'Opportunity'} • {opp.location || 'TBC'}</div>
                    </div>
                    <button className="mini edit" onClick={() => { setEditing(opp); setSelectedCalendarDate('') }}>Edit</button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {editing && (
        <ReviewDetailPanel
          opportunity={editing}
          allOpportunities={opportunities}
          onSaveDraft={handleSaveDraft}
          suggestedScheduleDate={editingSuggestion}
          scheduleRuleInfo={editingRule}
          onClose={() => setEditing(null)}
        />
      )}

      {toast && (
        <div className="publish-toast" role="status">
          <span>{toast.message}</span>
          <a href={REAL_PORTAL_CONTENT_URL} target="_blank" rel="noreferrer">Review on real portal →</a>
          <button className="dismiss-error" onClick={() => setToast(null)} aria-label="Dismiss">×</button>
        </div>
      )}
    </div>
  )
}

export default App
