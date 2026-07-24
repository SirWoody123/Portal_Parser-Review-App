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
  const [editing, setEditing] = useState(null)
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
        if (editing?.rowIndex === rowIndex) {
          setEditing(null)
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

  const hasMore = filtered.length > visible.length

  useEffect(() => {
    setVisibleCount(ITEMS_PER_BATCH)
  }, [search, typeFilter])

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <div className="brand-lockup">
          <h1>ERIC</h1>
        </div>
        <nav>
          <button className="nav-item">Profile</button>
          <button className="nav-item">All posts</button>
          <button className="nav-item">All companies</button>
          <button className="nav-item is-active">To review</button>
          <button className="nav-item">Data dashboard</button>
          <button className="nav-item section-label" disabled>ACCOUNT</button>
          <button className="nav-item">Users</button>
          <button className="nav-item">Settings</button>
          <button className="nav-item">Support</button>
          <button className="nav-item">Log out</button>
        </nav>
        <div className="verified-pill">Verified</div>
      </aside>

      <main className="portal-content-wrap portal-content-only">
        <section className="portal-content review-feed">
          <header className="review-top-row">
            <div className="tabs">
              <button className="tab is-active">Content</button>
              <button className="tab">Profiles</button>
              <button className="tab">Scouted</button>
              <button className="tab">Upgrade</button>
            </div>

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
          </header>

          <div className="queue-count">{filtered.length} in queue</div>

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
                onEdit={opp => setEditing(opp)}
                onApprove={opp => handlePublish(opp.rowIndex, opp)}
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
      </main>

      {editing && (
        <ReviewDetailPanel
          opportunity={editing}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

export default App
