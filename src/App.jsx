import { useState, useEffect } from 'react'
import OpportunityList from './components/OpportunityList'
import ReviewDetailPanel from './components/ReviewDetailPanel'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const ITEMS_PER_BATCH = 8

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

function App() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_BATCH)

  useEffect(() => {
    fetchOpportunities()
  }, [])

  const fetchOpportunities = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_BASE}/queue-review`)
      if (!res.ok) throw new Error('Failed to fetch opportunities')
      const data = await res.json()
      const rows = data.opportunities || []
      setOpportunities(rows)
      setSelectedId(rows[0]?.rowIndex ?? null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (rowIndex, editedOpp) => {
    try {
      const res = await fetch(`${API_BASE}/update-queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex, editedOpportunity: editedOpp })
      })
      if (!res.ok) throw new Error('Failed to publish')
      setOpportunities(prev => {
        const next = prev.filter(o => o.rowIndex !== rowIndex)
        if (selectedId === rowIndex) {
          setSelectedId(next[0]?.rowIndex ?? null)
        }
        return next
      })
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSaveDraft = (rowIndex, updatedFields) => {
    setOpportunities(prev =>
      prev.map(opp =>
        opp.rowIndex === rowIndex
          ? { ...opp, ...updatedFields }
          : opp
      )
    )
  }

  const types = [
    'all',
    ...new Set(opportunities.map(o => o.opportunityType).filter(Boolean))
  ]

  const filtered = opportunities.filter(opp => {
    const matchesType = typeFilter === 'all' || opp.opportunityType === typeFilter
    return matchesType && searchMatch(opp, search)
  })

  const visible = filtered.slice(0, visibleCount)
  const selected = opportunities.find(o => o.rowIndex === selectedId) || visible[0] || null

  const hasMore = filtered.length > visible.length

  useEffect(() => {
    setVisibleCount(ITEMS_PER_BATCH)
  }, [search, typeFilter])

  useEffect(() => {
    if (!selected) {
      setSelectedId(filtered[0]?.rowIndex ?? null)
    }
  }, [filtered, selected])

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <div className="brand-lockup">
          <span className="brand-pill">Review</span>
          <h1>ERIC Portal</h1>
        </div>
        <nav>
          <button className="nav-item">Overview</button>
          <button className="nav-item is-active">Scouted</button>
          <button className="nav-item">Published</button>
          <button className="nav-item">Settings</button>
        </nav>
      </aside>

      <main className="portal-content-wrap">
        <section className="portal-content">
          <header className="review-header">
            <div>
              <p className="eyebrow">Tab 3</p>
              <h2>Scouted Review Queue</h2>
            </div>
            <div className="count-chip">{filtered.length} queued</div>
          </header>

          <div className="filter-row">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search title, location, salary"
              aria-label="Search opportunities"
            />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} aria-label="Filter by type">
              {types.map(type => (
                <option key={type} value={type}>{type === 'all' ? 'All categories' : type}</option>
              ))}
            </select>
          </div>

          {error && <div className="error">Error: {error}</div>}

          {loading ? (
            <div className="loading spinner-wrap" role="status" aria-live="polite">
              <span className="spinner" />
            </div>
          ) : opportunities.length === 0 ? (
            <div className="empty">No opportunities to review</div>
          ) : (
            <>
              <OpportunityList
                opportunities={visible}
                selectedId={selected?.rowIndex ?? null}
                onSelect={opp => setSelectedId(opp.rowIndex)}
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
        </section>

        <section className="detail-pane">
          {selected ? (
            <ReviewDetailPanel
              opportunity={selected}
              onSaveDraft={handleSaveDraft}
              onPublish={handlePublish}
            />
          ) : (
            <div className="empty detail-empty">Select an opportunity to start reviewing.</div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
