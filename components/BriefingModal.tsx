import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { formatCount, formatWan } from "../constants";
import { CABIN, type FunnelModel } from "../services/metrics";

interface Props {
  funnel: FunnelModel;
  onClose: () => void;
}

export default function BriefingModal({ funnel, onClose }: Props) {
  const [svg, setSvg] = useState("");
  const summary = [
    "师宗县学校食堂智慧监管运行简报（2026年10月）",
    "一期试点：公办小学 100% 纳入（118/118 校）",
    `下单 ${formatWan(funnel.orderAmount)} / ${formatCount(funnel.orderCount)} 笔 / ${funnel.orderSchools} 校`,
    `合规入库 ${formatWan(funnel.inboundAmount)}，学生出库 ${formatWan(funnel.outboundAmount)}`,
    `账实相符率 ${funnel.match.toFixed(1)}%，损耗率 ${funnel.loss.toFixed(1)}%`,
    `双人核验拍照率 ${CABIN.safety.photoRate.toFixed(1)}%，快检合格率 ${CABIN.safety.pesticideRate.toFixed(1)}%，索证索票 ${CABIN.safety.ticketRate.toFixed(1)}%`,
  ].join("\n");

  useEffect(() => {
    let alive = true;
    QRCode.toString(summary, { type: "svg", margin: 1, color: { dark: "#062033", light: "#e8f7ff" } })
      .then((markup) => { if (alive) setSvg(markup); })
      .catch(() => { if (alive) setSvg(""); });
    return () => { alive = false; };
  }, [summary]);

  async function downloadPng() {
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 1280;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#071426";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(62,224,255,0.45)";
    ctx.strokeRect(28, 28, 844, 1224);
    ctx.fillStyle = "#d7f3ff";
    ctx.font = "600 28px 'Noto Sans SC', sans-serif";
    ctx.fillText("师宗县学校食堂智慧监管运行简报", 56, 110);
    ctx.font = "16px 'Noto Sans SC', sans-serif";
    ctx.fillStyle = "#7f9bb3";
    ctx.fillText("2026年10月 · 师宗县教育体育局", 56, 146);
    ctx.fillStyle = "#d7f3ff";
    ctx.font = "18px 'Noto Sans SC', sans-serif";
    summary.split("\n").slice(1).forEach((line, index) => ctx.fillText(line, 56, 220 + index * 42));
    ctx.fillStyle = "#9ec3d8";
    ctx.fillText("典型经验：双人同框称重留痕，应下未下与轮休分开督办，", 56, 520);
    ctx.fillText("供应商低于 80% 自动标黄并可应急调配。", 56, 552);
    ctx.strokeStyle = "rgba(239,68,68,0.85)";
    ctx.beginPath();
    ctx.arc(760, 180, 70, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,140,140,0.9)";
    ctx.font = "14px 'Noto Sans SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("师宗县", 760, 170);
    ctx.fillText("教体局", 760, 192);
    ctx.textAlign = "left";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "师宗县学校食堂智慧监管运行简报-2026年10月.png";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" data-testid="briefing" onClick={(event) => event.stopPropagation()}>
        <header>
          <div>
            <p className="wm">师宗县教育体育局 · 迎检材料</p>
            <h2>学校食堂智慧监管运行简报（2026年10月）</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="关闭">×</button>
        </header>
        <div className="brief">
          <div>
            <p>一期试点：公办小学 100% 纳入（118/118 校）。未接入的学段不在迎检主视觉里以“0”示人，教学点轮休单列备案。</p>
            <div className="stat-grid">
              <div><div className="l">下单</div><div className="n num">{formatWan(funnel.orderAmount)}</div></div>
              <div><div className="l">合规入库</div><div className="n num">{formatWan(funnel.inboundAmount)}</div></div>
              <div><div className="l">学生出库</div><div className="n num">{formatWan(funnel.outboundAmount)}</div></div>
              <div><div className="l">账实相符</div><div className="n num">{funnel.match.toFixed(1)}%</div></div>
              <div><div className="l">拍照率</div><div className="n num">{CABIN.safety.photoRate.toFixed(1)}%</div></div>
              <div><div className="l">快检合格</div><div className="n num">{CABIN.safety.pesticideRate.toFixed(1)}%</div></div>
            </div>
            <p className="hint">资金穿透：入库到出库损耗 {funnel.loss.toFixed(1)}%，库存周转 {formatWan(funnel.turnover)}，没有形成幽灵食材。</p>
            <p className="hint">督办抓手：应下未下与超时未入库可当场下发局端提醒；供应商断供可切到其余两家达标供应商。</p>
            <div className="stamp">师宗县教育体育局<br />膳食监管</div>
          </div>
          <div>
            <div className="qr" data-testid="briefing-qr" dangerouslySetInnerHTML={{ __html: svg }} />
            <p className="hint">扫码带走本页口径的运行简报，便于回县汇报。</p>
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="action primary" data-testid="briefing-download" onClick={downloadPng}>下载简报长图</button>
          <button type="button" className="action" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
}
