import { useState } from "react";
import { formatWan } from "../constants";
import type { TrendPoint } from "../services/metrics";
import type { RankRow } from "../types";

interface Props {
  rows: RankRow[];
  trend: TrendPoint[];
  match: number;
  turnoverLabel: string;
  onSchool: (id: string) => void;
}

type Tab = "amount" | "verify" | "deviation";

export default function RankColumn({ rows, trend, match, turnoverLabel, onSchool }: Props) {
  const [tab, setTab] = useState<Tab>("amount");
  const sorted = [...rows].sort((left, right) => {
    if (tab === "verify") return left.verifyRate - right.verifyRate;
    if (tab === "deviation") return Math.abs(right.deviation) - Math.abs(left.deviation);
    return right.amount - left.amount;
  }).slice(0, 8);
  const max = Math.max(...sorted.map((row) => (tab === "amount" ? row.amount : tab === "verify" ? row.verifyRate : Math.abs(row.deviation))), 1);

  return (
    <aside className="col">
      <section className="panel grow">
        <h2>学校履约与餐标红黑榜</h2>
        <div className="tabs">
          <button type="button" className={tab === "amount" ? "on" : ""} onClick={() => setTab("amount")}>采购额</button>
          <button type="button" className={tab === "verify" ? "on" : ""} onClick={() => setTab("verify")}>核验率</button>
          <button type="button" className={tab === "deviation" ? "on" : ""} data-testid="tab-deviation" onClick={() => setTab("deviation")}>生均餐标偏离</button>
        </div>
        <div className="rank-list">
          {sorted.map((row, index) => {
            const bad = tab === "verify" ? row.verifyRate < 98 : tab === "deviation" ? Math.abs(row.deviation) >= 1.5 : false;
            const width = tab === "amount" ? row.amount / max : tab === "verify" ? row.verifyRate / 100 : Math.abs(row.deviation) / max;
            const value = tab === "amount"
              ? `${formatWan(row.amount)}  ${row.verifyRate}%`
              : tab === "verify"
                ? `${row.verifyRate}%`
                : `${row.deviation > 0 ? "+" : ""}${row.deviation.toFixed(1)}元`;
            return (
              <button
                type="button"
                key={row.school.id}
                className="rank-row"
                data-testid={index === 0 ? "rank-top" : `rank-${row.school.id}`}
                onClick={() => onSchool(row.school.id)}
              >
                <span className="idx num">{index + 1}</span>
                <span>
                  {row.school.shortName}
                  <span className="bar rank"><span style={{ width: `${Math.max(6, width * 100)}%` }} /></span>
                </span>
                <span className={bad ? "amt num bad" : "amt num"}>{value}</span>
              </button>
            );
          })}
          {!sorted.length && <p className="hint">当前筛选下没有已下单学校。</p>}
        </div>
      </section>
      <section className="panel grow">
        <h2>资金与库存日清月结</h2>
        <StockChart trend={trend} />
        <div className="chart-note">
          <span>账实相符率 <b className="num">{match.toFixed(1)}%</b></span>
          <span>正常库存周转 <b className="num">{turnoverLabel}</b></span>
        </div>
      </section>
    </aside>
  );
}

function StockChart({ trend }: { trend: TrendPoint[] }) {
  if (!trend.length) return <p className="hint">暂无出入库曲线。</p>;
  const width = 360;
  const height = 150;
  const pad = { l: 36, r: 8, t: 16, b: 22 };
  const max = Math.max(...trend.map((point) => Math.max(point.inbound, point.outbound)), 1);
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const step = innerW / trend.length;
  const y = (value: number) => pad.t + innerH - (value / max) * innerH;
  const matchY = (value: number) => pad.t + innerH - ((value - 94) / 6) * innerH;
  const line = trend.map((point, index) => `${index === 0 ? "M" : "L"}${(pad.l + index * step + step / 2).toFixed(1)} ${matchY(point.match).toFixed(1)}`).join(" ");
  return (
    <div className="chart" data-testid="stock-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="近30个教学日入库与出库">
        {[0.25, 0.5, 0.75].map((tick) => (
          <line key={tick} x1={pad.l} x2={width - pad.r} y1={y(max * tick)} y2={y(max * tick)} stroke="rgba(62,224,255,0.12)" />
        ))}
        {trend.map((point, index) => {
          const x = pad.l + index * step + 2;
          const barW = Math.max(2, step - 4);
          return (
            <g key={point.date}>
              <rect x={x} y={y(point.inbound)} width={barW / 2} height={pad.t + innerH - y(point.inbound)} fill="#38bdf8" opacity="0.9" />
              <rect x={x + barW / 2} y={y(point.outbound)} width={barW / 2} height={pad.t + innerH - y(point.outbound)} fill="#10b981" opacity="0.9" />
              {index % 5 === 0 && (
                <text x={x} y={height - 6} fill="#7f9bb3" fontSize="9">{point.label}</text>
              )}
            </g>
          );
        })}
        <path d={line} fill="none" stroke="#f5c451" strokeWidth="1.6" />
        <text x={4} y={12} fill="#7f9bb3" fontSize="10">入库</text>
        <text x={36} y={12} fill="#6ee7b7" fontSize="10">出库</text>
        <text x={68} y={12} fill="#f5c451" fontSize="10">相符率</text>
      </svg>
    </div>
  );
}
