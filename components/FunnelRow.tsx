import { formatCount, formatWan, RANGE_WORD } from "../constants";
import type { FunnelModel } from "../services/metrics";
import type { Filters } from "../types";

interface Props {
  filters: Filters;
  funnel: FunnelModel;
  onOpen: (key: "order" | "ready" | "check" | "overdue" | "inbound" | "outbound") => void;
}

export default function FunnelRow({ filters, funnel, onOpen }: Props) {
  const word = RANGE_WORD[filters.range];
  const cards = [
    {
      key: "order" as const,
      tone: "base",
      title: `${word}下单总额`,
      value: formatWan(funnel.orderAmount),
      meta: `${formatCount(funnel.orderCount)} 笔订单 | 覆盖 ${formatCount(funnel.orderSchools)} 校`,
      testid: "kpi-order",
    },
    {
      key: "ready" as const,
      tone: "pending",
      title: "待供货商备货",
      value: formatWan(funnel.readyAmount),
      meta: `${formatCount(funnel.readyCount)} 笔 | ${formatCount(funnel.readySchools)} 校 · 准点 ${funnel.onTime}%`,
      testid: "kpi-ready",
    },
    {
      key: "check" as const,
      tone: "pending",
      title: "待学校双人核验",
      value: formatWan(funnel.checkAmount),
      meta: `${formatCount(funnel.checkCount)} 笔 | ${formatCount(funnel.checkSchools)} 校`,
      testid: "kpi-check",
    },
    {
      key: "overdue" as const,
      tone: "alert",
      title: "已核验待入库",
      value: formatWan(funnel.waitInAmount),
      meta: `${formatCount(funnel.waitInCount)} 笔 | ${formatCount(funnel.waitInSchools)} 校 · 督办`,
      testid: "kpi-overdue",
    },
    {
      key: "inbound" as const,
      tone: "good",
      title: `${word}合规入库`,
      value: formatWan(funnel.inboundAmount),
      meta: `${formatCount(funnel.inboundCount)} 笔 | ${formatCount(funnel.inboundSchools)} 校`,
      testid: "kpi-inbound",
    },
    {
      key: "outbound" as const,
      tone: "good",
      title: `${word}学生出库`,
      value: formatWan(funnel.outboundAmount),
      meta: `损耗率 ${funnel.loss.toFixed(1)}%（正常）\n账实相符 ${funnel.match.toFixed(1)}% · 周转 ${formatWan(funnel.turnover)}`,
      testid: "kpi-outbound",
    },
  ];

  return (
    <section className="funnel" aria-label="资金闭环">
      {cards.map((card, index) => (
        <span key={card.key} style={{ display: "contents" }}>
          {index > 0 && <span className="arrow" aria-hidden="true">➔</span>}
          <button
            type="button"
            className={`kpi ${card.tone}`}
            data-testid={card.testid}
            onClick={() => onOpen(card.key)}
          >
            <div className="label">{card.title}</div>
            <div className="value num">{card.value}</div>
            <div className="meta">{card.meta}</div>
          </button>
        </span>
      ))}
    </section>
  );
}
