export function FieldLandscape() {
  return (
    <svg viewBox="0 0 300 210">
      <path d="M0 50Q70 0 150 40T300 25V210H0z" fill="var(--field-back)" />
      <path d="M0 90Q100 35 300 90V210H0z" fill="var(--field-mid)" />
      <path d="M0 135Q140 60 300 130V210H0z" fill="var(--field-front)" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path
          key={i}
          d={`M${-100 + i * 65} 210Q140 110 ${300 + i * 15} 115`}
          stroke="var(--field-line)"
          strokeWidth="7"
          fill="none"
        />
      ))}
      <rect
        x="190"
        y="65"
        width="56"
        height="32"
        rx="3"
        fill="var(--truck-body)"
      />
      <path d="M246 77h17l10 12v8h-27z" fill="var(--truck-cab)" />
      <circle cx="202" cy="99" r="7" fill="var(--truck-wheel)" />
      <circle cx="260" cy="99" r="7" fill="var(--truck-wheel)" />
      <path
        d="M211 70h19m-10-5v22"
        stroke="var(--truck-mark)"
        strokeWidth="2"
      />
    </svg>
  );
}
