import OpportunityCard from './OpportunityCard'

export default function OpportunityList({ opportunities, onEdit, onApprove, primaryLabel }) {
  return (
    <div className="list">
      {opportunities.map(opp => (
        <OpportunityCard
          key={opp.rowIndex}
          opportunity={opp}
          onEdit={() => onEdit(opp)}
          onApprove={() => onApprove(opp)}
          primaryLabel={primaryLabel}
        />
      ))}
    </div>
  )
}
