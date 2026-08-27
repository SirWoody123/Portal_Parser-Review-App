import OpportunityCard from './OpportunityCard'

export default function OpportunityList({ opportunities, onEdit, onApprove, onDelete, primaryLabel, state, getRealPortalUrl }) {
  return (
    <div className="list">
      {opportunities.map(opp => (
        <OpportunityCard
          key={opp.rowIndex || opp.id}
          opportunity={opp}
          onEdit={onEdit ? () => onEdit(opp) : undefined}
          onApprove={onApprove ? () => onApprove(opp) : undefined}
          onDelete={onDelete ? () => onDelete(opp) : undefined}
          primaryLabel={primaryLabel}
          state={state}
          realPortalUrl={getRealPortalUrl ? getRealPortalUrl(opp) : undefined}
        />
      ))}
    </div>
  )
}
