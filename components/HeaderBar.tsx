import { CABIN } from "../services/metrics";
import { MEAL_OPTIONS, RANGE_OPTIONS, STAGE_OPTIONS } from "../constants";
import type { Filters } from "../types";

interface Props {
  filters: Filters;
  inspection: boolean;
  onChange: (filters: Filters) => void;
  onToggleInspection: () => void;
  onBriefing: () => void;
}

export default function HeaderBar({ filters, inspection, onChange, onToggleInspection, onBriefing }: Props) {
  return (
    <header className="header">
      <div className="brand">
        <h1>{CABIN.title}</h1>
        <p className="subline">
          {CABIN.cabin} · {CABIN.pilot} | 数据实时同步：{CABIN.refreshedAt}
          {inspection ? " · 迎检演示中，采购单价已隐藏" : ""}
        </p>
      </div>
      <div className="controls">
        <button
          type="button"
          className={inspection ? "mode-btn on" : "mode-btn"}
          aria-pressed={inspection}
          data-testid="mode-toggle"
          onClick={onToggleInspection}
        >
          <i className="lamp" />
          迎检演示模式
        </button>
        <label className="field">
          学段
          <select
            className="select"
            data-testid="filter-stage"
            value={filters.stage}
            onChange={(event) => onChange({ ...filters, stage: event.target.value as Filters["stage"] })}
          >
            {STAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          餐别
          <select
            className="select"
            data-testid="filter-meal"
            value={filters.meal}
            onChange={(event) => onChange({ ...filters, meal: event.target.value as Filters["meal"] })}
          >
            {MEAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          时间
          <select
            className="select"
            data-testid="filter-range"
            value={filters.range}
            onChange={(event) => onChange({ ...filters, range: event.target.value as Filters["range"] })}
          >
            {RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <button type="button" className="brief-btn" data-testid="briefing-open" onClick={onBriefing}>
          生成迎检简报
        </button>
      </div>
    </header>
  );
}
