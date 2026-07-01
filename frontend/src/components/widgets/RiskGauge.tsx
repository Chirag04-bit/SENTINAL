interface RiskGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const getColor = (score: number) => {
  if (score < 31)  return { stroke: '#10B981', text: 'text-success',  label: 'Low Risk',      bg: 'bg-success/10'  };
  if (score < 61)  return { stroke: '#F59E0B', text: 'text-warning',  label: 'Medium Risk',   bg: 'bg-warning/10'  };
  if (score < 81)  return { stroke: '#F97316', text: 'text-orange-400',label: 'High Risk',    bg: 'bg-orange-500/10'};
  return            { stroke: '#EF4444', text: 'text-danger',  label: 'Critical Risk', bg: 'bg-danger/10'   };
};

const SIZE_CONFIG = {
  sm: { size: 80,  strokeWidth: 6,  fontSize: 'text-lg' },
  md: { size: 120, strokeWidth: 8,  fontSize: 'text-2xl' },
  lg: { size: 160, strokeWidth: 10, fontSize: 'text-4xl' },
};

export default function RiskGauge({ score, size = 'md', showLabel = true }: RiskGaugeProps) {
  const { size: sz, strokeWidth: sw, fontSize } = SIZE_CONFIG[size];
  const { stroke, text, label, bg } = getColor(score);

  const radius = (sz - sw) / 2;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (score / 100) * circumference;
  const cx = sz / 2;
  const cy = sz / 2;

  return (
    <div className="flex flex-col items-center gap-2 risk-gauge">
      <div className="relative" style={{ width: sz, height: sz / 2 + sw }}>
        <svg width={sz} height={sz / 2 + sw} viewBox={`0 0 ${sz} ${sz / 2 + sw}`}>
          {/* Background arc */}
          <path
            d={`M ${sw / 2} ${cy} A ${radius} ${radius} 0 0 1 ${sz - sw / 2} ${cy}`}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} strokeLinecap="round"
          />
          {/* Score arc */}
          <path
            d={`M ${sw / 2} ${cy} A ${radius} ${radius} 0 0 1 ${sz - sw / 2} ${cy}`}
            fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 8px ${stroke}60)` }}
          />
        </svg>
        {/* Score number */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className={`${fontSize} font-bold text-white leading-none`}>{score}</span>
          <span className={`text-[10px] font-medium ${text} mt-0.5`}>/100</span>
        </div>
      </div>

      {showLabel && (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${bg}`}>
          <span className={`text-sm font-bold ${text}`}>{label}</span>
        </div>
      )}

      <p className="text-[10px] text-slate-600 italic text-center max-w-[140px] leading-relaxed">
        A score showing how risky the current activity appears.
      </p>
    </div>
  );
}
