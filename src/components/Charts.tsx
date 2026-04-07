export function Heatmap({ data }: { data: Array<{ dateKey: string; ratio: number; label: string }> }) {
  return (
    <div>
      <div className="heatmap" role="img" aria-label="12 week completion heatmap">
        {data.map((cell) => (
          <div
            key={cell.dateKey}
            className={`heat-cell level-${Math.min(4, Math.max(0, Math.ceil(cell.ratio * 4)))}`}
            title={cell.label}
            aria-label={cell.label}
          >
            <span className="sr-only">{cell.label}</span>
            <span className="pattern" />
          </div>
        ))}
      </div>
      <div className="legend-row muted">
        <span>Less</span>
        <span className="legend-box level-1" />
        <span className="legend-box level-2" />
        <span className="legend-box level-3" />
        <span className="legend-box level-4" />
        <span>More</span>
      </div>
    </div>
  )
}

export function BarChart({ data }: { data: Array<{ short: string; total: number }> }) {
  const max = Math.max(1, ...data.map((item) => item.total))
  return (
    <div className="bar-chart" role="img" aria-label="Monthly completion bar chart">
      {data.map((item) => (
        <div key={item.short} className="bar-col">
          <div className="bar-track">
            <div className="bar-fill" style={{ height: `${(item.total / max) * 100}%` }} />
          </div>
          <strong>{item.total}</strong>
          <span>{item.short}</span>
        </div>
      ))}
    </div>
  )
}

export function TrendLine({ data }: { data: Array<{ label: string; value: number }> }) {
  const points = data
    .map((item, index) => `${index * (100 / Math.max(1, data.length - 1))},${100 - item.value * 100}`)
    .join(' ')

  return (
    <div>
      <svg className="trend-line" viewBox="0 0 100 100" role="img" aria-label="Rolling 30 day consistency trend">
        <defs>
          <pattern id="linePattern" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="1" opacity="0.15" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="url(#linePattern)" rx="6" />
        <polyline fill="none" stroke="currentColor" strokeWidth="2.5" points={points} />
        {data.map((item, index) => (
          <circle key={item.label} cx={index * (100 / Math.max(1, data.length - 1))} cy={100 - item.value * 100} r="2.2" fill="currentColor" />
        ))}
      </svg>
      <div className="trend-labels muted">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  )
}
