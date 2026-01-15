interface DataPoint {
  label: string;
  value: number;
}

interface RadarChartProps {
  data: DataPoint[];
  size?: number;
}

export function RadarChart({ data, size = 300 }: RadarChartProps) {
  const padding = 80;
  const viewBoxSize = size + padding * 2;
  const center = viewBoxSize / 2;
  const maxRadius = size * 0.35;
  const levels = 5;

  const angleStep = (2 * Math.PI) / data.length;
  const startAngle = -Math.PI / 2;

  const getPoint = (index: number, value: number) => {
    const angle = startAngle + angleStep * index;
    const radius = (value / 100) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  };

  const getLabelPoint = (index: number) => {
    const angle = startAngle + angleStep * index;
    const radius = maxRadius + 50;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  };

  const dataPoints = data.map((d, i) => getPoint(i, d.value));
  const pathData = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      className="mx-auto"
    >
      {[...Array(levels)].map((_, i) => {
        const levelRadius = maxRadius * ((i + 1) / levels);
        const levelPoints = data.map((_, index) => {
          const angle = startAngle + angleStep * index;
          return {
            x: center + levelRadius * Math.cos(angle),
            y: center + levelRadius * Math.sin(angle)
          };
        });
        const levelPath = levelPoints.map((p, idx) =>
          `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
        ).join(' ') + ' Z';

        return (
          <path
            key={`level-${i}`}
            d={levelPath}
            fill="none"
            stroke="rgba(166, 124, 82, 0.2)"
            strokeWidth="1"
          />
        );
      })}

      {data.map((_, index) => {
        const endpoint = getPoint(index, 100);
        return (
          <line
            key={`axis-${index}`}
            x1={center}
            y1={center}
            x2={endpoint.x}
            y2={endpoint.y}
            stroke="rgba(166, 124, 82, 0.3)"
            strokeWidth="1"
          />
        );
      })}

      <path
        d={pathData}
        fill="rgba(166, 124, 82, 0.3)"
        stroke="var(--pale-gold)"
        strokeWidth="2"
        style={{
          filter: 'drop-shadow(0 0 10px rgba(166, 124, 82, 0.6))'
        }}
      />

      {dataPoints.map((point, index) => (
        <circle
          key={`point-${index}`}
          cx={point.x}
          cy={point.y}
          r="4"
          fill="var(--pale-gold)"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(166, 124, 82, 0.8))'
          }}
        />
      ))}

      {data.map((item, index) => {
        const labelPoint = getLabelPoint(index);
        const angle = startAngle + angleStep * index;
        let textAnchor: 'start' | 'middle' | 'end' = 'middle';

        if (angle > -Math.PI / 4 && angle < Math.PI / 4) {
          textAnchor = 'start';
        } else if (angle > 3 * Math.PI / 4 || angle < -3 * Math.PI / 4) {
          textAnchor = 'end';
        }

        return (
          <g key={`label-${index}`}>
            <text
              x={labelPoint.x}
              y={labelPoint.y - 10}
              textAnchor={textAnchor}
              fontSize="14"
              fontWeight="500"
              style={{ fill: 'var(--pale-light)' }}
            >
              {item.label}
            </text>
            <text
              x={labelPoint.x}
              y={labelPoint.y + 10}
              textAnchor={textAnchor}
              fontSize="16"
              fontWeight="700"
              style={{ fill: 'var(--pale-gold)' }}
            >
              {item.value}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
