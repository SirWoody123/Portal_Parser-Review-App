import { useState } from 'react'
import OpportunityCard from './OpportunityCard'

export default function OpportunityList({ opportunities, onPublish }) {
  const [page, setPage] = useState(0)
  const itemsPerPage = 5
  const start = page * itemsPerPage
  const end = start + itemsPerPage
  const pageItems = opportunities.slice(start, end)

  return (
    <div className="list">
      {pageItems.map(opp => (
        <OpportunityCard key={opp.rowIndex} opportunity={opp} onPublish={onPublish} />
      ))}
      {opportunities.length > itemsPerPage && (
        <div className="pagination">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>← Prev</button>
          <span>{page + 1} of {Math.ceil(opportunities.length / itemsPerPage)}</span>
          <button onClick={() => setPage(page + 1)} disabled={end >= opportunities.length}>Next →</button>
        </div>
      )}
    </div>
  )
}
