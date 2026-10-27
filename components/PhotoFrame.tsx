interface Props {
  school: string;
  time: string;
  goods: string;
  qty: string;
  inspectors: string;
}

export default function PhotoFrame({ school, time, goods, qty, inspectors }: Props) {
  return (
    <svg viewBox="0 0 320 180" role="img" aria-label={`${school}验收实拍`}>
      <rect width="320" height="180" fill="#10283f" />
      <rect x="16" y="28" width="120" height="78" rx="4" fill="#1d4e3a" />
      <rect x="28" y="40" width="40" height="28" fill="#34d399" />
      <rect x="74" y="48" width="46" height="22" fill="#6ee7b7" />
      <rect x="150" y="78" width="70" height="8" fill="#94a3b8" />
      <rect x="168" y="86" width="34" height="46" fill="#cbd5e1" />
      <circle cx="185" cy="70" r="10" fill="#e2e8f0" />
      <text x="176" y="74" fontSize="8" fill="#0f172a">秤</text>
      <circle cx="214" cy="96" r="14" fill="#38bdf8" />
      <rect x="204" y="110" width="20" height="28" fill="#38bdf8" />
      <circle cx="250" cy="96" r="14" fill="#f5c451" />
      <rect x="240" y="110" width="20" height="28" fill="#f5c451" />
      <text x="12" y="18" fill="#d7f3ff" fontSize="12">{time} 双人同框称重</text>
      <text x="12" y="164" fill="#9ec3d8" fontSize="11">{goods} {qty} · {inspectors}</text>
      <text x="12" y="176" fill="#7f9bb3" fontSize="10">{school}</text>
    </svg>
  );
}
