// ─── SENTINEL Skeleton Loader ─────────────────────────────────────────────────
// Animated placeholder shown while data is loading.
// Prevents layout shift and gives users feedback that content is coming.
//
// Usage:
//   <Skeleton className="h-10 w-full" />
//   <Skeleton.Card />       ← Pre-built stat card skeleton
//   <Skeleton.Table rows={5} cols={6} />  ← Table skeleton

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

function SkeletonBase({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`bg-white/5 rounded-lg animate-pulse ${className}`}
      style={style}
      role="status"
      aria-label="Loading..."
    />
  );
}

// ─── Stat Card Skeleton ───────────────────────────────────────────────────────
function SkeletonStatCard() {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <SkeletonBase className="w-10 h-10 rounded-xl" />
        <SkeletonBase className="w-12 h-4" />
      </div>
      <div className="space-y-2">
        <SkeletonBase className="w-24 h-3" />
        <SkeletonBase className="w-16 h-7" />
        <SkeletonBase className="w-32 h-3" />
      </div>
    </div>
  );
}

// ─── Table Skeleton ───────────────────────────────────────────────────────────
function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 border-b border-white/5">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBase key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-3">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonBase
              key={c}
              className={`h-4 flex-1 ${c === 0 ? 'max-w-[120px]' : ''}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Chart Skeleton ───────────────────────────────────────────────────────────
function SkeletonChart({ height = 200 }: { height?: number }) {
  return (
    <div className="space-y-3">
      <SkeletonBase className="w-40 h-4" />
      <SkeletonBase className="w-64 h-3" />
      <SkeletonBase style={{ height }} className="w-full rounded-lg" />
    </div>
  );
}

// ─── Compose sub-components ───────────────────────────────────────────────────
const Skeleton = Object.assign(SkeletonBase, {
  Card:  SkeletonStatCard,
  Table: SkeletonTable,
  Chart: SkeletonChart,
});

export default Skeleton;
