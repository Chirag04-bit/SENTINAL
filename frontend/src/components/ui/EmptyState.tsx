// ─── SENTINEL EmptyState ──────────────────────────────────────────────────────
// Shown when a list, table, or search returns no results.
// Prevents users from seeing a blank page with no explanation.
//
// Usage:
//   <EmptyState
//     icon="🔍"
//     title="No alerts found"
//     description="Try adjusting your filters or date range."
//     action={{ label: 'Clear Filters', onClick: clearFilters }}
//   />

interface EmptyStateProps {
  icon?:        string;
  title:        string;
  description?: string;
  action?: {
    label:   string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_STYLES = {
  sm: { wrapper: 'py-8',  icon: 'text-3xl', title: 'text-sm', desc: 'text-xs' },
  md: { wrapper: 'py-12', icon: 'text-4xl', title: 'text-base', desc: 'text-sm' },
  lg: { wrapper: 'py-20', icon: 'text-5xl', title: 'text-lg',  desc: 'text-base' },
};

export default function EmptyState({
  icon = '📭',
  title,
  description,
  action,
  size = 'md',
}: EmptyStateProps) {
  const s = SIZE_STYLES[size];
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${s.wrapper} animate-fade-in`}
      role="status" aria-label={title}>
      <span className={s.icon}>{icon}</span>
      <div className="text-center">
        <p className={`font-semibold text-white ${s.title}`}>{title}</p>
        {description && (
          <p className={`text-slate-500 mt-1 max-w-xs ${s.desc}`}>{description}</p>
        )}
      </div>
      {action && (
        <button onClick={action.onClick} className="btn-ghost btn-sm mt-1">
          {action.label}
        </button>
      )}
    </div>
  );
}
