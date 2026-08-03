import OpportunityCard from './OpportunityCard'

export default function OpportunityList({ opportunities, onEdit, onApprove, onDelete, primaryLabel }) {
  return (
    <div className="list">
      {opportunities.map(opp => (
        <OpportunityCard
          key={opp.rowIndex}
          opportunity={opp}
          onEdit={() => onEdit(opp)}
          onApprove={() => onApprove(opp)}
          onDelete={() => onDelete(opp)}
          primaryLabel={primaryLabel}
        />
      ))}
    </div>
  )
}
