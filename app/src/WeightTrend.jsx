import React from "react";

// A small, static SVG avoids a charting runtime, resize observers and animation
// work for this twelve-point trend. It scales with the available phone width.
export default function WeightTrend({ data, unit }) {
  const values = data.map(point => point.kg);
  const low = Math.min(...values), high = Math.max(...values);
  const spread = high - low || Math.max(1, Math.abs(low) * 0.02);
  const floor = low - spread * 0.15, ceiling = high + spread * 0.15;
  const points = data.map((point, index) => ({
    ...point,
    x: 36 + index / Math.max(1, data.length - 1) * 288,
    y: 112 - (point.kg - floor) / (ceiling - floor) * 92,
  }));
  const labels = new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]);
  return (
    <svg viewBox="0 0 344 146" className="weight-trend" role="img" aria-label={`Weight trend: ${data.map(point => `${point.date}: ${point.kg} ${unit}`).join(", ")}`}>
      {[low, (low + high) / 2, high].filter((value, index, all) => all.indexOf(value) === index).map(value => {
        const y = 112 - (value - floor) / (ceiling - floor) * 92;
        return <g key={value}><line x1="36" x2="324" y1={y} y2={y} stroke="#262932" /><text x="30" y={y + 4} textAnchor="end" fill="#a6a8b3" fontSize="10">{Math.round(value * 10) / 10}</text></g>;
      })}
      <polyline points={points.map(point => `${point.x},${point.y}`).join(" ")} fill="none" stroke="#f0b429" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {points.map((point, index) => <g key={index}>
        <circle cx={point.x} cy={point.y} r="3" fill="#f0b429"><title>{point.date}: {point.kg} {unit}</title></circle>
        {labels.has(index) && <text x={point.x} y="138" textAnchor={index === 0 ? "start" : index === data.length - 1 ? "end" : "middle"} fill="#a6a8b3" fontSize="10">{point.date}</text>}
      </g>)}
    </svg>
  );
}
