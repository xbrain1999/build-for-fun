import { formatYuan, maskPerson } from "../constants";
import PhotoFrame from "./PhotoFrame";
import { findSchool, findSupplier } from "../services/metrics";

interface Props {
  schoolId: string;
  batchId: string;
  inspection: boolean;
  marked?: "pass" | "rectify";
  onClose: () => void;
  onMark: (schoolId: string, mark: "pass" | "rectify") => void;
}

export default function VoucherModal({ schoolId, batchId, inspection, marked, onClose, onMark }: Props) {
  const school = findSchool(schoolId);
  const batch = school?.batches.find((item) => item.id === batchId);
  if (!school || !batch) return null;
  const supplier = findSupplier(school.supplierId);
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" data-testid="voucher" onClick={(event) => event.stopPropagation()}>
        <header>
          <div>
            <h2>{school.shortName} · 订单凭证</h2>
            <p className="hint">{batch.id} · {batch.time} · {batch.goods}</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="关闭">×</button>
        </header>
        <div className="voucher">
          <section className="sheet">
            <h3>供货商发货单</h3>
            <p>供应商：{supplier?.shortName}</p>
            <p>品名：{batch.goods}</p>
            <p>数量：{batch.qty}{batch.unit}</p>
            <p>金额：{formatYuan(batch.amount)}</p>
            <p>单价：{inspection ? "迎检模式已隐藏" : `${formatYuan(batch.unitPrice)}/${batch.unit}`}</p>
            <p>状态：{batch.status}</p>
          </section>
          <section className="sheet">
            <h3>检疫与农残报告</h3>
            <p>证明编号：{batch.certNo}</p>
            <p>动物检疫 / 承诺达标合格证：已归档</p>
            <p>农残快检：{batch.pesticide}</p>
            <p>索证索票：齐全</p>
            <div className="stamp">票证<br />已核</div>
          </section>
          <section className="sheet">
            <h3>双人同框称重</h3>
            <PhotoFrame
              school={school.shortName}
              time={batch.time}
              goods={batch.goods}
              qty={`${batch.qty}${batch.unit}`}
              inspectors={batch.inspectors.map((name) => maskPerson(name, inspection)).join("、")}
            />
            <p>{batch.photoNote}</p>
            <p>验收人：{batch.inspectors.map((name) => maskPerson(name, inspection)).join("、")}</p>
          </section>
        </div>
        {marked && <p className="hint" style={{ padding: "0 14px 8px" }}>{marked === "pass" ? "本单已标记为迎检抽查合格。" : "已发起票货不符退换 / 整改单。"}</p>}
        <div className="modal-actions">
          <button type="button" className="action primary" data-testid="mark-pass" onClick={() => onMark(school.id, "pass")}>标记为迎检抽查合格</button>
          <button type="button" className="action danger" data-testid="mark-rectify" onClick={() => onMark(school.id, "rectify")}>发现票货不符，发起整改单</button>
        </div>
      </div>
    </div>
  );
}
