import { useEffect, useMemo, useState } from "react";
import AlertColumn from "./components/AlertColumn";
import BriefingModal from "./components/BriefingModal";
import CountyMap from "./components/CountyMap";
import FunnelRow from "./components/FunnelRow";
import HeaderBar from "./components/HeaderBar";
import RankColumn from "./components/RankColumn";
import SideDrawer, { superviseStamp } from "./components/SideDrawer";
import VoucherModal from "./components/VoucherModal";
import { formatWan } from "./constants";
import {
  alertLists,
  buildFunnel,
  featuredSchool,
  rankRows,
  schoolsForStage,
  supplierRows,
  TOWN_ORDER,
  trendSeries,
} from "./services/metrics";
import type { DrawerState, Filters, ModalState } from "./types";

const DEFAULT_FILTERS: Filters = { stage: "primary", meal: "self", range: "month" };

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function App() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [inspection, setInspection] = useState(false);
  const [drawer, setDrawer] = useState<DrawerState | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [supervised, setSupervised] = useState<Record<string, string>>({});
  const [urged, setUrged] = useState<Record<string, string>>({});
  const [reassigned, setReassigned] = useState(false);
  const [marks, setMarks] = useState<Record<string, "pass" | "rectify">>({});
  const [toast, setToast] = useState<string | null>(null);
  const [townIndex, setTownIndex] = useState(0);
  const [pinnedTown, setPinnedTown] = useState<string | null>(null);

  const funnel = useMemo(() => buildFunnel(filters), [filters]);
  const alerts = useMemo(() => alertLists(filters), [filters]);
  const ranked = useMemo(() => rankRows(filters), [filters]);
  const trend = useMemo(() => trendSeries(filters), [filters]);
  const suppliers = useMemo(() => supplierRows(filters), [filters]);
  const visibleSchools = useMemo(() => schoolsForStage(filters), [filters]);
  const highlightTown = inspection ? TOWN_ORDER[townIndex] : pinnedTown;
  const featured = highlightTown ? featuredSchool(highlightTown, filters) : null;

  useEffect(() => {
    if (!inspection || drawer || modal) return;
    const timer = window.setInterval(() => {
      setTownIndex((index) => (index + 1) % TOWN_ORDER.length);
    }, 15000);
    return () => window.clearInterval(timer);
  }, [inspection, drawer, modal]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (modal) setModal(null);
      else setDrawer(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  function supervise(ids: string[]) {
    const stamp = superviseStamp();
    setSupervised((current) => {
      const next = { ...current };
      ids.forEach((id) => { next[id] = stamp; });
      return next;
    });
    setToast(`已向 ${ids.length} 所学校校长及库管员发送督办提醒`);
  }

  return (
    <div className="cabin">
      <HeaderBar
        filters={filters}
        inspection={inspection}
        onChange={setFilters}
        onToggleInspection={() => {
          setInspection((value) => !value);
          setTownIndex(0);
        }}
        onBriefing={() => setModal({ kind: "briefing" })}
      />
      <FunnelRow
        filters={filters}
        funnel={funnel}
        onOpen={(key) => setDrawer({ kind: key })}
      />
      <div className="board">
        <AlertColumn
          alerts={{ missing: alerts.missing.length, overdue: alerts.overdue.length, rest: alerts.rest.length }}
          safety={{ photoRate: 99.2, pesticideRate: 100, ticketRate: 100 }}
          suppliers={suppliers.map((row) => ({
            ...row,
            urged: Boolean(urged[row.supplier.id]),
            reassigned: reassigned && row.supplier.id === "youyuan",
          }))}
          onAlert={(kind) => setDrawer({ kind })}
          onSafety={() => setDrawer({ kind: "safety" })}
          onSupplier={(supplierId) => setDrawer({ kind: "supplier", supplierId })}
        />
        <CountyMap
          schools={visibleSchools}
          filters={filters}
          highlightTown={highlightTown}
          featured={featured}
          inspection={inspection}
          onSchool={(schoolId) => setDrawer({ kind: "school", schoolId, tab: "batches" })}
          onTown={setPinnedTown}
        />
        <RankColumn
          rows={ranked}
          trend={trend}
          match={funnel.match}
          turnoverLabel={formatWan(funnel.turnover)}
          onSchool={(schoolId) => setDrawer({ kind: "school", schoolId, tab: "batches" })}
        />
      </div>

      {drawer && (
        <SideDrawer
          drawer={drawer}
          filters={filters}
          inspection={inspection}
          supervised={supervised}
          urged={urged}
          reassigned={reassigned}
          marks={marks}
          onClose={() => setDrawer(null)}
          onSupervise={supervise}
          onExport={(rows) => {
            downloadCsv("师宗县异常通报单.csv", rows);
            setToast("已导出异常通报单");
          }}
          onUrge={(id) => {
            setUrged((current) => ({ ...current, [id]: superviseStamp() }));
            setToast("已要求供应商 1 小时内上传备货出车凭证");
          }}
          onReassign={() => {
            setReassigned(true);
            setToast("五龙、龙庆、彩云片区缺货订单已临时切给师宗粮油和君达贸易");
          }}
          onOpenSchool={(schoolId) => setDrawer({ kind: "school", schoolId, tab: "batches" })}
          onOpenVoucher={(schoolId, batchId) => setModal({ kind: "voucher", schoolId, batchId })}
        />
      )}

      {modal?.kind === "voucher" && (
        <VoucherModal
          schoolId={modal.schoolId}
          batchId={modal.batchId}
          inspection={inspection}
          marked={marks[modal.schoolId]}
          onClose={() => setModal(null)}
          onMark={(schoolId, mark) => {
            setMarks((current) => ({ ...current, [schoolId]: mark }));
            setToast(mark === "pass" ? "已标记为迎检抽查合格" : "已发起票货不符整改单");
          }}
        />
      )}
      {modal?.kind === "briefing" && (
        <BriefingModal funnel={funnel} onClose={() => setModal(null)} />
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
