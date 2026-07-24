import OpportunityCard from './OpportunityCard'

export default function OpportunityList({ opportunities, selectedId, onSelect }) {
  return (
    <div className="list">
      {opportunities.map(opp => (
        <OpportunityCard
          key={opp.rowIndex}
          opportunity={opp}
          isSelected={selectedId === opp.rowIndex}
          onSelect={() => onSelect(opp)}
        />
      ))}
    </div>
  )
}
