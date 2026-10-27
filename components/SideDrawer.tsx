import { useState } from "react";
import { bandLabel, formatCount, formatWan, formatYuan, maskPerson, maskPhone } from "../constants";
import PhotoFrame from "./PhotoFrame";
import {
  alertLists,
  CABIN,
  findSchool,
  findSupplier,
  schoolsInPipeline,
  sliceAmount,
  schoolOrder,
  schoolPerCapita,
  schoolVerify,
  trendSeries,
} from "../services/metrics";
import type { DrawerState, Filters, School, SchoolTab } from "../types";

interface Props {
  drawer: DrawerState;
  filters: Filters;
  inspection: boolean;
  supervised: Record<string, string>;
  urged: Record<string, string>;
  reassigned: boolean;
  marks: Record<string, "pass" | "rectify">;
  onClose: () => void;
  onSupervise: (ids: string[]) => void;
  onExport: (rows: string[][]) => void;
  onUrge: (id: string) => void;
  onReassign: () => void;
  onOpenSchool: (id: string) => void;
  onOpenVoucher: (schoolId: string, batchId: string) => void;
}

function nowStamp(): string {
  const now = new Date();
  const hour = `${now.getHours()}`.padStart(2, "0");
  const minute = `${now.getMinutes()}`.padStart(2, "0");
  return `${hour}:${minute}`;
}

export function superviseStamp(): string {
  return `${nowStamp()} 局端催办，待回执`;
}

export default function SideDrawer(props: Props) {
  const { drawer, onClose } = props;
  return (
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" data-testid="drawer">
        {drawer.kind === "school" ? <SchoolBody {...props} schoolId={drawer.schoolId} initialTab={drawer.tab} /> : null}
        {drawer.kind === "supplier" ? <SupplierBody {...props} supplierId={drawer.supplierId} /> : null}
        {drawer.kind === "safety" ? <SafetyBody {...props} /> : null}
        {drawer.kind !== "school" && drawer.kind !== "supplier" && drawer.kind !== "safety" ? <ListBody {...props} /> : null}
      </aside>
    </>
  );
}

function ListBody(props: Props) {
  const { drawer, filters, inspection, supervised, onClose, onSupervise, onExport, onOpenSchool } = props;
  const alerts = alertLists(filters);
  const titleMap = {
    missing: "应下未下 · 督办清单",
    overdue: "已核验待入库 · 督办清单",
    rest: "教学点 / 轮休备案",
    ready: "待供货商备货",
    check: "待学校双人核验",
    order: "本期已下单学校",
    inbound: "本期合规入库",
    outbound: "本期学生出库",
  } as const;
  let schools: School[] = [];
  if (drawer.kind === "missing") schools = alerts.missing;
  if (drawer.kind === "overdue") schools = alerts.overdue;
  if (drawer.kind === "rest") schools = alerts.rest;
  if (drawer.kind === "ready") schools = schoolsInPipeline(filters, "waitReadyAmount");
  if (drawer.kind === "check") schools = schoolsInPipeline(filters, "waitCheckAmount");
  if (drawer.kind === "order") schools = schoolsInPipeline(filters, "orderAmount");
  if (drawer.kind === "inbound") schools = schoolsInPipeline(filters, "inboundAmount");
  if (drawer.kind === "outbound") schools = schoolsInPipeline(filters, "outboundAmount");
  const actionable = drawer.kind === "missing" || drawer.kind === "overdue";
  const title = titleMap[drawer.kind as keyof typeof titleMap] || "明细";

  return (
    <>
      <header>
        <div>
          <h2>{title}</h2>
          <p className="hint">共 {schools.length} 校 · 点开学校可继续下钻</p>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="关闭">×</button>
      </header>
      <div className="drawer-body drawer-list">
        {!schools.length && <p className="hint">当前筛选下没有这类学校。</p>}
        {schools.map((school) => {
          const done = supervised[school.id];
          const amount = drawer.kind === "ready" ? sliceAmount(school, filters, "waitReadyAmount")
            : drawer.kind === "check" ? sliceAmount(school, filters, "waitCheckAmount")
              : drawer.kind === "inbound" ? sliceAmount(school, filters, "inboundAmount")
                : drawer.kind === "outbound" ? sliceAmount(school, filters, "outboundAmount")
                  : schoolOrder(school, filters);
          return (
            <button type="button" key={school.id} className="row-card" onClick={() => onOpenSchool(school.id)}>
              <div className="top">
                <b>{school.shortName}</b>
                {done ? <span className="pill done">已督办（{done}）</span> : school.overdueInbound ? <span className="pill">已超时 {school.overdueHours} 小时</span> : school.rest ? <span className="pill">已备案</span> : null}
              </div>
              <p className="hint">{school.town} · 食安总监 {maskPerson(school.director, inspection)} · {maskPhone(school.phone)}</p>
              {school.blockReason && <p className="hint">{school.blockReason}</p>}
              {amount > 0 && <p className="hint">涉及金额 {formatWan(amount)}</p>}
            </button>
          );
        })}
      </div>
      {actionable && (
        <div className="drawer-actions">
          <button
            type="button"
            className="action primary"
            data-testid="supervise-all"
            onClick={() => onSupervise(schools.map((school) => school.id))}
          >
            一键下发局端督办提醒
          </button>
          <button
            type="button"
            className="action"
            data-testid="export-ledger"
            onClick={() => onExport(toCsv(schools, supervised, inspection, drawer.kind === "overdue"))}
          >
            导出异常通报单
          </button>
        </div>
      )}
    </>
  );
}

function toCsv(schools: School[], supervised: Record<string, string>, inspection: boolean, overdue: boolean): string[][] {
  const rows = [["学校", "乡镇", "问题", "超时小时", "食安总监", "电话", "卡点原因", "状态"]];
  schools.forEach((school) => {
    rows.push([
      school.shortName,
      school.town,
      overdue ? "已核验待入库" : "应下未下",
      overdue ? String(school.overdueHours) : "",
      maskPerson(school.director, inspection),
      maskPhone(school.phone),
      school.blockReason,
      supervised[school.id] ? `已督办（${supervised[school.id]}）` : "待督办",
    ]);
  });
  return rows;
}

function SchoolBody(props: Props & { schoolId: string; initialTab?: SchoolTab }) {
  const { schoolId, filters, inspection, marks, onClose, onOpenVoucher, initialTab } = props;
  const school = findSchool(schoolId);
  const [tab, setTab] = useState<SchoolTab>(initialTab || "batches");
  if (!school) return null;
  const perCapita = schoolPerCapita(school, filters);
  const verify = schoolVerify(school, filters);
  const trend = trendSeries({ ...filters, stage: "all", meal: filters.meal });
  const share = school.meals.self.inboundAmount;
  const countyIn = CABIN.schools.reduce((total, item) => total + item.meals.self.inboundAmount, 0) || 1;
  const mark = marks[school.id];
  return (
    <>
      <header>
        <div>
          <h2>{school.shortName}</h2>
          <p className="hint">{school.town} · {school.fullName}</p>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="关闭">×</button>
      </header>
      <div className="drawer-body">
        <div className="stat-grid">
          <div><div className="l">在校就餐</div><div className="n num">{formatCount(school.students)} 人</div></div>
          <div><div className="l">本期采购额</div><div className="n num">{formatWan(schoolOrder(school, filters))}</div></div>
          <div><div className="l">生均每日食材</div><div className="n num">{perCapita ? `¥${perCapita.toFixed(1)}` : "—"}</div></div>
        </div>
        <p className="hint">食安总监 {maskPerson(school.director, inspection)} · {maskPhone(school.phone)} · 核验率 {verify || "—"}% · {bandLabel(perCapita)}</p>
        {mark === "pass" && <p className="pill ok">已标记迎检抽查合格</p>}
        {mark === "rectify" && <p className="pill">已发起票货不符整改单</p>}
        <div className="tabs">
          <button type="button" className={tab === "batches" ? "on" : ""} onClick={() => setTab("batches")}>今日配送批次</button>
          <button type="button" className={tab === "photos" ? "on" : ""} onClick={() => setTab("photos")}>双人核验实拍</button>
          <button type="button" className={tab === "ledger" ? "on" : ""} onClick={() => setTab("ledger")}>近30天出入库</button>
        </div>
        {tab === "batches" && (
          <div>
            {!school.batches.length && <p className="hint">今日尚未上传可穿透的配送批次。月度台账仍可在第三页查看。</p>}
            {school.batches.map((batch) => (
              <button type="button" key={batch.id} className="row-card" data-testid={`batch-${batch.id}`} onClick={() => onOpenVoucher(school.id, batch.id)}>
                <div className="top"><b>{batch.time} {batch.goods}</b><span className="pill">{batch.status}</span></div>
                <p className="hint">{batch.qty}{batch.unit} · 金额 {formatYuan(batch.amount)} · {inspection ? "单价已隐藏" : `单价 ${formatYuan(batch.unitPrice)}/${batch.unit}`}</p>
              </button>
            ))}
          </div>
        )}
        {tab === "photos" && (
          <div className="photo-grid">
            {(school.batches.length ? school.batches : [{
              id: "empty", time: "—", goods: "待上传", qty: 0, unit: "", inspectors: ["—", "—"], photoNote: "暂无实拍",
            }]).map((batch) => (
              <figure key={batch.id} className="photo">
                <button type="button" onClick={() => batch.id !== "empty" && onOpenVoucher(school.id, batch.id)}>
                  <PhotoFrame
                    school={school.shortName}
                    time={batch.time}
                    goods={batch.goods}
                    qty={`${batch.qty}${batch.unit || ""}`}
                    inspectors={batch.inspectors.map((name) => maskPerson(name, inspection)).join("、")}
                  />
                </button>
                <figcaption>{batch.photoNote || "双人验收实拍"}</figcaption>
              </figure>
            ))}
          </div>
        )}
        {tab === "ledger" && (
          <div>
            {trend.slice(-12).map((point) => (
              <div key={point.date} className="sup-row">
                <span>{point.label}</span>
                <span className="num hint">入 {formatWan(share / countyIn * point.inbound)} / 出 {formatWan(share / countyIn * point.outbound)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function SupplierBody(props: Props & { supplierId: string }) {
  const { supplierId, urged, reassigned, onClose, onUrge, onReassign } = props;
  const supplier = findSupplier(supplierId);
  if (!supplier) return null;
  const mine = CABIN.schools.filter((school) => school.supplierId === supplier.id && !school.rest && !school.missingOrder);
  return (
    <>
      <header>
        <div>
          <h2>{supplier.shortName}</h2>
          <p className="hint">{supplier.fullName}</p>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="关闭">×</button>
      </header>
      <div className="drawer-body">
        <div className="stat-grid">
          <div><div className="l">准点率</div><div className="n num">{supplier.onTime}%</div></div>
          <div><div className="l">合格率</div><div className="n num">{supplier.qualified}%</div></div>
          <div><div className="l">退换货</div><div className="n num">{supplier.returns} 次</div></div>
        </div>
        <p className="hint">配送片区 {supplier.towns.join("、")} · 在供 {mine.length} 校</p>
        {urged[supplier.id] && <p className="pill done">已下发履约催办（{urged[supplier.id]}）</p>}
        {reassigned && supplier.warn && <p className="pill ok">片区订单已临时切给师宗粮油、君达贸易</p>}
        <h3 style={{ margin: "10px 0 6px", fontSize: 14 }}>未备货学校与缺货品类</h3>
        {supplier.shortages.length === 0 && <p className="hint">当前没有缺货告警。</p>}
        {supplier.shortages.map((item) => (
          <div key={item.school + item.goods} className="row-card">
            <b>{item.school}</b>
            <p className="hint">{item.goods} {item.qty} · {reassigned && supplier.warn ? "已改派，预计按原时效补齐" : item.eta}</p>
          </div>
        ))}
      </div>
      <div className="drawer-actions">
        <button type="button" className="action warn" data-testid="urge-supplier" onClick={() => onUrge(supplier.id)}>下发履约催办令</button>
        <button type="button" className="action danger" data-testid="reassign-supplier" onClick={onReassign} disabled={!supplier.warn && !reassigned}>
          启动应急调配预案
        </button>
      </div>
    </>
  );
}

function SafetyBody({ onClose, inspection }: Props) {
  const samples = CABIN.schools.flatMap((school) => school.batches.map((batch) => ({ school, batch }))).slice(0, 6);
  return (
    <>
      <header>
        <div>
          <h2>今日后厨验收实拍</h2>
          <p className="hint">拍照率 {CABIN.safety.photoRate.toFixed(1)}% · 快检 {CABIN.safety.pesticideRate.toFixed(1)}% · 索票 {CABIN.safety.ticketRate.toFixed(1)}%</p>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="关闭">×</button>
      </header>
      <div className="drawer-body">
        <div className="photo-grid">
          {samples.map(({ school, batch }) => (
            <figure key={batch.id} className="photo">
              <PhotoFrame
                school={school.shortName}
                time={batch.time}
                goods={batch.goods}
                qty={`${batch.qty}${batch.unit}`}
                inspectors={batch.inspectors.map((name) => maskPerson(name, inspection)).join("、")}
              />
              <figcaption>{batch.photoNote}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </>
  );
}
