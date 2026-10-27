import { formatCount, formatWan } from "../constants";
import type { Supplier } from "../types";

interface AlertCounts {
  missing: number;
  overdue: number;
  rest: number;
}

interface SupplierRow {
  supplier: Supplier;
  schools: number;
  amount: number;
  urged: boolean;
  reassigned: boolean;
}

interface Props {
  alerts: AlertCounts;
  safety: { photoRate: number; pesticideRate: number; ticketRate: number };
  suppliers: SupplierRow[];
  onAlert: (kind: "missing" | "overdue" | "rest") => void;
  onSafety: () => void;
  onSupplier: (id: string) => void;
}

export default function AlertColumn({ alerts, safety, suppliers, onAlert, onSafety, onSupplier }: Props) {
  return (
    <aside className="col">
      <section className="panel">
        <h2>异常预警与督办席</h2>
        <button type="button" className="alert-row" data-testid="alert-missing" onClick={() => onAlert("missing")}>
          <i className="dot-key red" />
          <span>应下未下学校 <small>红牌督办</small></span>
          <b className="count num">{alerts.missing}<small> 校</small></b>
        </button>
        <button type="button" className="alert-row" data-testid="alert-overdue" onClick={() => onAlert("overdue")}>
          <i className="dot-key amber" />
          <span>超时未入库 <small>超 24 小时</small></span>
          <b className="count num">{alerts.overdue}<small> 校</small></b>
        </button>
        <button type="button" className="alert-row" data-testid="alert-rest" onClick={() => onAlert("rest")}>
          <i className="dot-key gray" />
          <span>教学点 / 轮休 <small>已备案</small></span>
          <b className="count num">{alerts.rest}<small> 校</small></b>
        </button>
      </section>

      <section className="panel">
        <h2>阳光食安与验收留痕</h2>
        <button type="button" className="safe-row" data-testid="safety-open" onClick={onSafety}>
          <span className="safe-ico" aria-hidden="true">📸</span>
          <span>双人核验拍照率</span>
          <b className="rate num">{safety.photoRate.toFixed(1)}%</b>
        </button>
        <button type="button" className="safe-row" onClick={onSafety}>
          <span className="safe-ico" aria-hidden="true">🧪</span>
          <span>农残快检合格率</span>
          <b className="rate num">{safety.pesticideRate.toFixed(1)}%</b>
        </button>
        <button type="button" className="safe-row" onClick={onSafety}>
          <span className="safe-ico" aria-hidden="true">📄</span>
          <span>索证索票齐全率</span>
          <b className="rate num">{safety.ticketRate.toFixed(1)}%</b>
        </button>
      </section>

      <section className="panel grow">
        <h2>供货商 SLA 履约考核</h2>
        <div className="rank-list">
          {suppliers.map((row, index) => {
            const warn = row.supplier.warn && !row.reassigned;
            return (
              <button
                type="button"
                key={row.supplier.id}
                className={warn ? "sup-row warn" : "sup-row"}
                data-testid={`supplier-${row.supplier.id}`}
                onClick={() => onSupplier(row.supplier.id)}
              >
                <span>
                  <span className="name">{index + 1}. {row.supplier.shortName}</span>
                  <span className="sup-meta"> {formatCount(row.schools)} 校 · {formatWan(row.amount)}</span>
                  <span className={warn ? "bar sla warn" : "bar sla"}>
                    <span style={{ width: `${row.supplier.onTime}%` }} />
                  </span>
                </span>
                <span>
                  <b className="num">{row.supplier.onTime}%</b>
                  <div className={warn ? "tag amber" : "tag green"}>
                    {row.reassigned ? "应急保供" : row.urged ? "已催办" : warn ? "待提速" : "准点"}
                  </div>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
