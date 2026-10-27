import { useMemo, useState } from "react";
import townsJson from "../data/shizongTowns.json";
import { formatCount, formatWan } from "../constants";
import { CABIN, schoolOrder } from "../services/metrics";
import type { Filters, School, TownCollection, TownFeature } from "../types";

interface Props {
  schools: School[];
  filters: Filters;
  highlightTown: string | null;
  featured: School | null;
  inspection: boolean;
  onSchool: (id: string) => void;
  onTown: (name: string) => void;
}

const TOWNS = townsJson as TownCollection;

function polysOf(feature: TownFeature): number[][][][] {
  if (feature.geometry.type === "Polygon") return [feature.geometry.coordinates as number[][][]];
  return feature.geometry.coordinates as number[][][][];
}

function inRing(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi) inside = !inside;
  }
  return inside;
}

function townAt(lng: number, lat: number): string | null {
  for (const feature of TOWNS.features) {
    for (const poly of polysOf(feature)) {
      if (!poly[0] || !inRing(lng, lat, poly[0])) continue;
      if (poly.slice(1).some((hole) => inRing(lng, lat, hole))) continue;
      return feature.properties.name;
    }
  }
  return null;
}

const STATUS_TEXT: Record<School["mapStatus"], string> = {
  ok: "正常履约",
  checking: "配送核验中",
  alert: "超时未入库",
  missing: "应下未下",
  rest: "备案轮休",
};

export default function CountyMap({ schools, filters, highlightTown, featured, inspection, onSchool, onTown }: Props) {
  const [hover, setHover] = useState<{ name: string; x: number; y: number } | null>(null);
  const layout = useMemo(() => {
    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;
    TOWNS.features.forEach((feature) => {
      polysOf(feature).forEach((poly) => {
        poly.forEach((ring) => {
          ring.forEach(([lng, lat]) => {
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
          });
        });
      });
    });
    const midLat = ((minLat + maxLat) / 2) * Math.PI / 180;
    const cos = Math.cos(midLat);
    const width = (maxLng - minLng) * cos;
    const height = maxLat - minLat;
    const pad = 0.04;
    return {
      project(lng: number, lat: number) {
        const x = ((lng - minLng) * cos / width) * (1000 * (1 - pad * 2)) + 1000 * pad;
        const y = ((maxLat - lat) / height) * (760 * (1 - pad * 2)) + 760 * pad;
        return [x, y] as const;
      },
      view: "0 0 1000 760",
    };
  }, []);

  const paths = TOWNS.features.map((feature) => {
    let d = "";
    polysOf(feature).forEach((poly) => {
      poly.forEach((ring) => {
        ring.forEach((point, index) => {
          const [x, y] = layout.project(point[0], point[1]);
          d += `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
        });
        d += "Z";
      });
    });
    return { feature, d };
  });

  const counts = { ok: 0, checking: 0, rest: 0, bad: 0 };
  schools.forEach((school) => {
    if (school.mapStatus === "ok") counts.ok += 1;
    else if (school.mapStatus === "checking") counts.checking += 1;
    else if (school.mapStatus === "rest") counts.rest += 1;
    else counts.bad += 1;
  });

  const hoverTown = hover?.name || null;
  const hoverSchools = hoverTown ? schools.filter((school) => (townAt(school.lng, school.lat) || school.town) === hoverTown) : [];
  const hoverAmount = hoverSchools.reduce((total, school) => total + schoolOrder(school, filters), 0);
  const hoverBad = hoverSchools.filter((school) => school.mapStatus === "alert" || school.mapStatus === "missing").length;

  return (
    <section className="panel map-panel">
      <h2>师宗县全域监管沙盘</h2>
      <div className="legend">
        <span><i className="ok" />正常履约 {counts.ok}</span>
        <span><i className="checking" />配送核验中 {counts.checking}</span>
        <span><i className="rest" />备案轮休 {counts.rest}</span>
        <span><i className="bad" />异常预警 {counts.bad}</span>
      </div>
      <div className="map-stage">
        <svg viewBox={layout.view} role="img" aria-label="师宗县乡镇边界">
          {paths.map(({ feature, d }) => (
            <path
              key={feature.properties.code}
              className={highlightTown === feature.properties.name ? "town active" : "town"}
              d={d}
              fillRule="evenodd"
              data-testid={`town-${feature.properties.name}`}
              onMouseEnter={(event) => {
                const bounds = (event.currentTarget.ownerSVGElement?.parentElement as HTMLElement).getBoundingClientRect();
                setHover({
                  name: feature.properties.name,
                  x: event.clientX - bounds.left + 12,
                  y: event.clientY - bounds.top + 12,
                });
              }}
              onMouseMove={(event) => {
                const bounds = (event.currentTarget.ownerSVGElement?.parentElement as HTMLElement).getBoundingClientRect();
                setHover({
                  name: feature.properties.name,
                  x: event.clientX - bounds.left + 12,
                  y: event.clientY - bounds.top + 12,
                });
              }}
              onMouseLeave={() => setHover(null)}
              onClick={() => onTown(feature.properties.name)}
            />
          ))}
          {paths.map(({ feature }) => {
            const nudge: Record<string, [number, number]> = {
              葵山: [16, -8],
              雄壁: [0, -12],
              五龙: [6, -14],
              高良: [-6, 10],
              丹凤: [8, -8],
              漾月: [-10, 10],
            };
            const [dx, dy] = nudge[feature.properties.name] || [0, 0];
            const [x, y] = layout.project(feature.properties.label[0], feature.properties.label[1]);
            return (
              <text key={feature.properties.name} className="town-label" x={x + dx} y={y + dy} textAnchor="middle">
                {feature.properties.name}
              </text>
            );
          })}
          {schools.map((school) => {
            const [x, y] = layout.project(school.lng, school.lat);
            return (
              <circle
                key={school.id}
                className={`map-dot ${school.mapStatus}`}
                cx={x}
                cy={y}
                r={school.mapStatus === "alert" || school.mapStatus === "missing" ? 7 : 5}
                data-testid={`school-dot-${school.id}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onSchool(school.id);
                }}
              >
                <title>{`${school.shortName} · ${STATUS_TEXT[school.mapStatus]}`}</title>
              </circle>
            );
          })}
        </svg>
        {hover && (
          <div className="hover-card" style={{ left: hover.x, top: hover.y }}>
            <b>{hover.name}</b>
            <div className="hint">{formatCount(hoverSchools.length)} 校 · 采购 {formatWan(hoverAmount)}</div>
            <div className="hint">异常 {hoverBad} 校</div>
          </div>
        )}
        {inspection && featured && (
          <div className="feature-card" data-testid="feature-card">
            <div className="hint">轮播 · 优秀学校档案</div>
            <b>{featured.shortName}</b>
            <div className="hint">{featured.town} · 采购 {formatWan(schoolOrder(featured, filters))} · 核验 {featured.meals.self.verifyRate}%</div>
          </div>
        )}
      </div>
      <div className="ticker" data-testid="ticker">
        <div className="ticker-track">
          {[...CABIN.ticker, ...CABIN.ticker].map((line, index) => (
            <span key={`${line}-${index}`}>{line}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
