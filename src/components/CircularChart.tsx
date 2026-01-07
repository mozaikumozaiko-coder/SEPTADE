interface CircularChartProps {
  percentage: number;
  label: string;
  size?: number;
  strokeWidth?: number;
}

export function CircularChart({ percentage, label, size = 120, strokeWidth = 8 }: CircularChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(166, 124, 82, 0.2)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--pale-gold)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(166, 124, 82, 0.6))',
            transition: 'stroke-dashoffset 1s ease-out'
          }}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="transform rotate-90 text-2xl font-bold"
          style={{ fill: 'var(--pale-gold)', transformOrigin: 'center' }}
        >
          {percentage}%
        </text>
      </svg>
      <p className="text-sm font-medium text-center opacity-90" style={{ color: 'var(--pale-light)' }}>
        {label}
      </p>
    </div>
  );
}
