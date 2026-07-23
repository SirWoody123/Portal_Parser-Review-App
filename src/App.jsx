import { useState, useEffect } from 'react'
import OpportunityList from './components/OpportunityList'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function App() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
      setOpportunities(data.opportunities || [])
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
      setOpportunities(opportunities.filter(o => o.rowIndex !== rowIndex))
      alert('Published successfully!')
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  return (
    <div className="app">
      <header>
        <h1>📋 Review Queue</h1>
        <p>Edit and publish opportunities to the ERIC portal</p>
      </header>

      {error && <div className="error">Error: {error}</div>}
      {loading ? (
        <div className="loading">Loading opportunities...</div>
      ) : opportunities.length === 0 ? (
        <div className="empty">No opportunities to review</div>
      ) : (
        <OpportunityList opportunities={opportunities} onPublish={handlePublish} />
      )}
    </div>
  )
}

export default App
