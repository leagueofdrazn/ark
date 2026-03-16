"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  ReferenceLine,
} from "recharts";
import type { DashboardData, Experiment, EventEntry, Phase } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────
function StatusDot({ color, pulse }: { color: string; pulse?: boolean }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full mr-1.5 align-middle ${pulse ? "dot-pulse" : ""}`}
      style={{ background: `var(--${color})`, boxShadow: `0 0 4px var(--${color})` }}
    />
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--border)] bg-[var(--bg-card)] rounded-md px-4 py-3">
      <div className="text-[0.7rem] uppercase tracking-wider text-[var(--text2)] mb-1">{label}</div>
      <div className="text-xl text-[var(--text)]">{value}</div>
    </div>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[0.8rem] font-semibold text-[var(--amber)] uppercase tracking-widest mb-3 pb-1.5 border-b border-[var(--border)]">
      {children}
    </div>
  );
}

function EmptyState({ msg, cmd }: { msg: string; cmd?: string }) {
  return (
    <div className="text-center py-10 text-[var(--text3)] text-sm">
      {msg}
      {cmd && (
        <div className="mt-2">
          <code className="bg-[var(--code-bg)] border border-[var(--border)] px-3 py-1 rounded text-[var(--amber)] text-xs">{cmd}</code>
        </div>
      )}
    </div>
  );
}

function GaugeBar({ label, value, max, pct }: { label: string; value: string; max: string; pct: number }) {
  const clamped = Math.min(pct * 100, 100);
  const danger = clamped > 80;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-[var(--text2)] mb-1">
        <span>{label}</span>
        <span className="text-[var(--text)]">{value} / {max}</span>
      </div>
      <div className="h-1.5 bg-[var(--border)] rounded-sm overflow-hidden">
        <div
          className="h-full rounded-sm transition-all"
          style={{ width: `${clamped}%`, background: danger ? "var(--red)" : "var(--amber)" }}
        />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [dark, setDark] = useState(false);
  const [live, setLive] = useState(true);

  const fetchData = useCallback(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((d: DashboardData) => setData(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchData();
    if (!live) return;
    const id = setInterval(fetchData, 2000);
    return () => clearInterval(id);
  }, [fetchData, live]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--text3)]">
        Loading...
      </div>
    );
  }

  const { kit, experiments, events, researchActive, currentPhaseIdx } = data;
  const phases = kit.metric.phases;
  const activeMetric = phases && currentPhaseIdx >= 0
    ? phases[currentPhaseIdx].metric
    : kit.metric.primary;
  const activeDirection = phases && currentPhaseIdx >= 0
    ? phases[currentPhaseIdx].direction
    : kit.metric.direction;

  // Merge floors
  const allFloors = { ...kit.metric.floors };
  if (phases && currentPhaseIdx >= 0) {
    Object.assign(allFloors, phases[currentPhaseIdx].floors);
  }

  // Metric columns (everything except commit, status, description)
  const metricCols = kit.columns.filter(
    (c) => !["commit", "status", "description"].includes(c)
  );

  // Stats
  const validExps = experiments.filter((e) => e[activeMetric] !== undefined);
  const validVals = validExps.map((e) => e[activeMetric] as number);
  const bestVal = validVals.length > 0
    ? (activeDirection === "lower" ? Math.min(...validVals) : Math.max(...validVals))
    : null;
  const baselineVal = validVals.length > 0 ? validVals[0] : null;
  const keepCount = experiments.filter((e) => e.status === "keep" || e.status === "baseline").length;
  const discardCount = experiments.filter((e) => e.status === "discard").length;

  let improvement = 0;
  if (baselineVal && bestVal && baselineVal !== 0) {
    improvement = activeDirection === "lower"
      ? (baselineVal - bestVal) / Math.abs(baselineVal) * 100
      : (bestVal - baselineVal) / Math.abs(baselineVal) * 100;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-50 bg-[var(--bg)] border-b border-[var(--border)] px-6">
        <div className="flex items-center h-12 gap-6">
          <span className="text-lg font-bold text-[var(--amber)] tracking-[0.15em]">
            ARK
          </span>
          <span className="text-sm text-[var(--text2)]">{kit.name}</span>

          <div className="flex-1" />

          <label className="flex items-center gap-2 text-xs text-[var(--text2)] cursor-pointer select-none">
            <div
              className={`relative w-8 h-4 rounded-full transition-colors ${
                live ? "bg-[var(--green)]" : "bg-[var(--border-accent)]"
              }`}
              onClick={() => setLive(!live)}
            >
              <div
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                  live ? "translate-x-[18px]" : "translate-x-0.5"
                }`}
              />
            </div>
            Live
            <span className="relative group">
              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-[var(--border-accent)] text-[0.6rem] text-[var(--text3)] cursor-help">i</span>
              <span className="absolute top-full right-0 mt-1.5 px-2.5 py-1.5 rounded bg-[var(--bg-card)] border border-[var(--border)] text-[0.65rem] text-[var(--text2)] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                Auto-refreshes every 2s. Turn off to freeze the view.
              </span>
            </span>
          </label>

          <label className="flex items-center gap-2 text-xs text-[var(--text2)] cursor-pointer select-none">
            Light
            <div
              className={`relative w-8 h-4 rounded-full transition-colors ${
                dark ? "bg-[var(--amber)]" : "bg-[var(--border-accent)]"
              }`}
              onClick={() => setDark(!dark)}
            >
              <div
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                  dark ? "translate-x-[18px]" : "translate-x-0.5"
                }`}
              />
            </div>
            Dark
          </label>
        </div>
      </nav>

      <main className="px-6 py-4">
        {/* ─── Status ─── */}
        <div className="flex items-center gap-2 mb-4">
          {researchActive ? (
            <>
              <StatusDot color="green" pulse />
              <span className="text-xs uppercase tracking-wider text-[var(--green)]">live</span>
            </>
          ) : (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--text3)] opacity-50 mr-1.5" />
              <span className="text-xs uppercase tracking-wider text-[var(--text3)]">idle</span>
            </>
          )}
          {kit.description && (
            <span className="ml-4 text-xs text-[var(--text3)]">{kit.description}</span>
          )}
        </div>

        {/* ─── Experiment Summary ─── */}
        <ExperimentSummary kit={kit} activeMetric={activeMetric} activeDirection={activeDirection} allFloors={allFloors} />

        {/* ─── Phase Banner ─── */}
        {phases && currentPhaseIdx >= 0 && (
          <PhaseBanner phases={phases} currentIdx={currentPhaseIdx} validVals={validVals} />
        )}

        {/* ─── KPI Cards ─── */}
        {validVals.length > 0 && (
          <>
            <SectionHead>Current Best</SectionHead>
            <div className="grid grid-cols-5 gap-3 mb-2">
              <Metric label={`Best ${activeMetric}`} value={bestVal !== null ? bestVal.toFixed(4) : "---"} />
              <Metric label="Baseline" value={baselineVal !== null ? baselineVal.toFixed(4) : "---"} />
              <Metric label="Improvement" value={`${improvement >= 0 ? "+" : ""}${improvement.toFixed(1)}%`} />
              <Metric label="Keep Rate" value={`${experiments.length > 0 ? (keepCount / experiments.length * 100).toFixed(0) : 0}%`} />
              <Metric label="Total" value={`${experiments.length}`} />
            </div>
            <div className="text-xs text-[var(--text2)] mb-6">
              {keepCount} kept / {discardCount} discarded / {experiments.length} total
              {` · ${activeMetric} (${activeDirection} is better)`}
            </div>
          </>
        )}

        {/* ─── Progress Chart ─── */}
        {experiments.length > 0 ? (
          <>
            <SectionHead>Research Progress</SectionHead>
            <ProgressChart
              experiments={experiments}
              metricCols={metricCols}
              defaultMetric={activeMetric}
              defaultDirection={activeDirection}
              allFloors={allFloors}
              phaseGateExps={[]}
            />
          </>
        ) : (
          <EmptyState msg="No experiments yet. Run your first experiment to see data here." cmd="claude 'Read program.md and start the experiment loop'" />
        )}

        {/* ─── Floor Gauges ─── */}
        {Object.keys(allFloors).length > 0 && validVals.length > 0 && (
          <FloorGauges experiments={experiments} floors={allFloors} />
        )}

        {/* ─── Experiment Log ─── */}
        {experiments.length > 0 && (
          <>
            <SectionHead>Experiment Log</SectionHead>
            <ExperimentTable experiments={experiments} metricCols={metricCols} activeMetric={activeMetric} activeDirection={activeDirection} />
          </>
        )}

        {/* ─── Event Log ─── */}
        {events.length > 0 && <EventLog events={events} />}

        {/* ─── Diminishing Returns ─── */}
        {validVals.length >= 5 && (
          <DiminishingReturns values={validVals} direction={activeDirection} />
        )}
      </main>
    </div>
  );
}

// ─── Phase Banner ─────────────────────────────────────────
function PhaseBanner({ phases, currentIdx, validVals }: { phases: Phase[]; currentIdx: number; validVals: number[] }) {
  const phase = phases[currentIdx];
  const gate = phase.gate;

  let gateStatus = "";
  if (gate && validVals.length > 0) {
    const best = phase.direction === "lower" ? Math.min(...validVals) : Math.max(...validVals);
    const met = gate.direction === "below" ? best <= gate.threshold : best >= gate.threshold;
    if (met) {
      gateStatus = " · GATE MET";
    } else {
      const remaining = gate.direction === "below" ? best - gate.threshold : gate.threshold - best;
      gateStatus = ` · ${Math.abs(remaining).toFixed(4)} to go`;
    }
  }

  return (
    <div className="border border-[var(--violet)] bg-[var(--bg-card)] rounded-md px-4 py-3 mb-6">
      <span className="text-sm font-semibold text-[var(--violet)]">
        Phase {currentIdx + 1}/{phases.length}: {phase.name}
      </span>
      <span className="text-xs text-[var(--text2)] ml-3">
        {phase.metric} ({phase.direction} is better)
        {gate && ` · Gate: ${gate.direction} ${gate.threshold}`}
        {gateStatus}
      </span>
    </div>
  );
}

// ─── Progress Chart ───────────────────────────────────────
function ProgressChart({
  experiments,
  metricCols,
  defaultMetric,
  defaultDirection,
  allFloors,
  phaseGateExps,
}: {
  experiments: Experiment[];
  metricCols: string[];
  defaultMetric: string;
  defaultDirection: string;
  allFloors: Record<string, { value: number; direction: string }>;
  phaseGateExps: number[];
}) {
  const [metricKey, setMetricKey] = useState(defaultMetric);
  const direction = metricKey === defaultMetric ? defaultDirection : "higher";
  const higherIsBetter = direction === "higher";
  const floor = allFloors[metricKey];

  const chartData = useMemo(() => {
    let runningBest = higherIsBetter ? -Infinity : Infinity;
    return experiments.map((e, i) => {
      const val = e[metricKey] as number | undefined;
      const isKept = e.status === "keep" || e.status === "baseline";
      if (val !== undefined && isKept) {
        const isBetter = higherIsBetter ? val > runningBest : val < runningBest;
        if (isBetter) runningBest = val;
      }
      return {
        idx: i + 1,
        value: val ?? null,
        status: e.status,
        description: e.description ?? "",
        bestLine: runningBest !== (higherIsBetter ? -Infinity : Infinity) ? runningBest : null,
      };
    });
  }, [experiments, metricKey, higherIsBetter]);

  const kept = experiments.filter((e) => e.status === "keep" || e.status === "baseline").length;

  return (
    <div className="border border-[var(--border)] bg-[var(--bg-card)] rounded-md p-4 mb-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-xs text-[var(--text2)]">
          {experiments.length} Experiments, {kept} Kept
        </div>
        <div className="flex-1" />
        <span className="text-xs text-[var(--text3)]">View:</span>
        <select
          value={metricKey}
          onChange={(e) => setMetricKey(e.target.value)}
          className="text-xs bg-[var(--bg)] border border-[var(--border)] rounded px-2 py-1 text-[var(--text)] outline-none"
        >
          {metricCols.map((col) => (
            <option key={col} value={col}>{col}{col === defaultMetric ? " (primary)" : ""}</option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          <XAxis
            dataKey="idx"
            label={{ value: "Experiment #", position: "bottom", offset: 0, style: { fill: "var(--text3)", fontSize: 11 } }}
            tick={{ fill: "var(--text3)", fontSize: 10 }}
            stroke="var(--border)"
          />
          <YAxis
            label={{ value: metricKey, angle: -90, position: "insideLeft", offset: 10, style: { fill: "var(--text3)", fontSize: 11 } }}
            tick={{ fill: "var(--text3)", fontSize: 10 }}
            stroke="var(--border)"
            domain={["auto", "auto"]}
            reversed={!higherIsBetter}
          />
          <Tooltip
            contentStyle={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              fontSize: 12,
              color: "var(--text)",
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={((value: any, name: any) => {
              const v = Number(value);
              if (name === "bestLine") return [isNaN(v) ? "--" : v.toFixed(4), "Running Best"];
              return [isNaN(v) ? "--" : v.toFixed(4), metricKey];
            }) as any}
            labelFormatter={((label: any) => {
              const d = chartData[Number(label) - 1];
              return d?.description ? `#${label}: ${d.description}` : `Experiment #${label}`;
            }) as any}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ fontSize: 11 }}
            {...{ payload: [
              { value: "Discarded", type: "circle", color: "var(--text3)" },
              { value: "Kept", type: "circle", color: "var(--green)" },
              { value: "Running best", type: "line", color: "var(--green)" },
            ] }}
          />
          {/* Floor line */}
          {floor && (
            <ReferenceLine
              y={floor.value}
              stroke="var(--red)"
              strokeDasharray="6 3"
              label={{ value: `Floor: ${floor.value}`, position: "left", fill: "var(--red)", fontSize: 10 }}
            />
          )}
          {/* Phase gate vertical lines */}
          {phaseGateExps.map((x, i) => (
            <ReferenceLine
              key={i}
              x={x}
              stroke="var(--violet)"
              strokeDasharray="6 3"
            />
          ))}
          <Line
            dataKey="bestLine"
            type="stepAfter"
            stroke="var(--green)"
            strokeWidth={2}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
          <Scatter dataKey="value" isAnimationActive={false}>
            {chartData.map((d, i) => (
              <Cell
                key={i}
                fill={
                  d.status === "keep" || d.status === "baseline"
                    ? "var(--green)"
                    : d.status === "crash"
                    ? "var(--red)"
                    : "var(--text3)"
                }
                opacity={d.status === "keep" || d.status === "baseline" ? 1 : 0.4}
              />
            ))}
          </Scatter>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Floor Gauges ─────────────────────────────────────────
function FloorGauges({
  experiments,
  floors,
}: {
  experiments: Experiment[];
  floors: Record<string, { value: number; direction: string }>;
}) {
  // Use latest kept experiment values
  const keptExps = experiments.filter((e) => e.status === "keep" || e.status === "baseline");
  const latest = keptExps.length > 0 ? keptExps[keptExps.length - 1] : experiments[experiments.length - 1];
  if (!latest) return null;

  return (
    <div className="mb-6">
      <SectionHead>Floor Constraints</SectionHead>
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(floors).map(([name, floor]) => {
          const val = latest[name] as number | undefined;
          if (val === undefined) return null;

          const safe = floor.direction === "lower" ? val <= floor.value : val >= floor.value;
          const margin = floor.direction === "lower" ? floor.value - val : val - floor.value;
          const marginPct = floor.value !== 0 ? Math.abs(margin / floor.value) : 0;

          return (
            <div key={name} className="border border-[var(--border)] bg-[var(--bg-card)] rounded-md px-4 py-3">
              <div className="text-[0.7rem] uppercase tracking-wider text-[var(--text2)] mb-1">{name}</div>
              <div className={`text-xl ${safe ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
                {typeof val === "number" ? val.toFixed(4) : String(val)}
              </div>
              <div className="text-xs text-[var(--text3)] mt-1">
                {safe ? (marginPct < 0.2 ? "Warning: near floor" : "Safe") : "VIOLATES floor"}
                {` (${floor.direction === "lower" ? "≤" : "≥"} ${floor.value})`}
              </div>
              <GaugeBar
                label=""
                value={val.toFixed(4)}
                max={String(floor.value)}
                pct={floor.direction === "lower" ? val / floor.value : floor.value / val}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Experiment Table ─────────────────────────────────────
function ExperimentTable({
  experiments,
  metricCols,
  activeMetric,
  activeDirection,
}: {
  experiments: Experiment[];
  metricCols: string[];
  activeMetric: string;
  activeDirection: string;
}) {
  const [statusFilter, setStatusFilter] = useState<"all" | "keep" | "discard">("all");
  const [search, setSearch] = useState("");

  let rows = [...experiments];
  if (statusFilter !== "all") {
    rows = rows.filter((e) =>
      statusFilter === "keep"
        ? e.status === "keep" || e.status === "baseline"
        : e.status === statusFilter
    );
  }
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter(
      (e) =>
        (e.description ?? "").toLowerCase().includes(q) ||
        e.commit.toLowerCase().includes(q)
    );
  }
  rows.reverse();

  // Find best value for highlighting
  const allVals = experiments.map((e) => e[activeMetric] as number).filter((v) => v !== undefined);
  const bestForHighlight = allVals.length > 0
    ? (activeDirection === "lower" ? Math.min(...allVals) : Math.max(...allVals))
    : null;

  const filterBtn = (label: string, value: typeof statusFilter) => (
    <button
      onClick={() => setStatusFilter(value)}
      className={`px-2 py-0.5 rounded text-xs transition-colors ${
        statusFilter === value
          ? "bg-[var(--amber)] text-[var(--bg)]"
          : "text-[var(--text2)] hover:text-[var(--text)]"
      }`}
    >
      {label}
    </button>
  );

  const headers = ["#", "Commit", ...metricCols, "Status", "Description"];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-1 border border-[var(--border)] rounded-md px-1 py-0.5">
          {filterBtn("All", "all")}
          {filterBtn("Keep", "keep")}
          {filterBtn("Discard", "discard")}
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs bg-[var(--bg-card)] border border-[var(--border)] rounded px-2 py-1 text-[var(--text)] outline-none placeholder-[var(--text3)] w-48"
        />
        <span className="text-xs text-[var(--text3)] ml-auto">{rows.length} results</span>
      </div>

      <div className="border border-[var(--border)] rounded-md overflow-auto max-h-[500px]">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[var(--table-header)] text-[var(--text2)] text-xs uppercase tracking-wider">
              {headers.map((h) => (
                <th key={h} className="sticky top-0 bg-[var(--table-header)] text-left px-3 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((e, i) => {
              const origIdx = experiments.indexOf(e) + 1;
              const metricVal = e[activeMetric] as number | undefined;
              const isBest = metricVal !== undefined && metricVal === bestForHighlight;

              return (
                <tr
                  key={i}
                  className={`border-b border-[var(--border)] hover:bg-[var(--table-hover)] ${
                    i % 2 === 0 ? "bg-[var(--table-row-even)]" : "bg-[var(--table-row-odd)]"
                  }`}
                >
                  <td className="px-3 py-1.5 text-[var(--text3)]">{origIdx}</td>
                  <td className="px-3 py-1.5 text-[var(--text)]">{e.commit}</td>
                  {metricCols.map((col) => {
                    const v = e[col];
                    const isActiveCol = col === activeMetric;
                    const highlight = isActiveCol && isBest;
                    return (
                      <td
                        key={col}
                        className={`px-3 py-1.5 ${
                          highlight
                            ? "text-[var(--green)] font-semibold"
                            : "text-[var(--text)]"
                        }`}
                      >
                        {v !== undefined ? (typeof v === "number" ? v.toFixed(4) : String(v)) : "--"}
                      </td>
                    );
                  })}
                  <td className={`px-3 py-1.5 ${
                    e.status === "keep" || e.status === "baseline"
                      ? "text-[var(--green)]"
                      : e.status === "crash"
                      ? "text-[var(--red)]"
                      : "text-[var(--text3)]"
                  }`}>
                    {e.status}
                  </td>
                  <td className="px-3 py-1.5 text-[var(--text)] max-w-[300px] whitespace-normal">
                    {e.description ?? ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Event Log ────────────────────────────────────────────
function EventLog({ events }: { events: EventEntry[] }) {
  const [expanded, setExpanded] = useState(false);

  const colorMap: Record<string, string> = {
    FLAG: "var(--amber)",
    KEEP: "var(--green)",
    BASELINE: "var(--green)",
    DISCARD: "var(--red)",
    CRASH: "var(--red)",
    INSIGHT: "var(--violet)",
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-[0.8rem] font-semibold text-[var(--amber)] uppercase tracking-widest mb-3 pb-1.5 border-b border-[var(--border)] w-full text-left flex items-center gap-2"
      >
        Event Log ({events.length})
        <span className="text-xs text-[var(--text3)]">{expanded ? "▼" : "▶"}</span>
      </button>
      {expanded && (
        <div className="border border-[var(--border)] bg-[var(--bg-card)] rounded-md p-4 max-h-[340px] overflow-auto space-y-1">
          {[...events].reverse().map((ev, i) => (
            <div key={i} className="text-xs">
              <span className="text-[var(--text3)]">{ev.timestamp}</span>
              {ev.exp_num !== null && <span className="text-[var(--text2)] ml-2">#{ev.exp_num}</span>}
              <span className="ml-2 font-semibold" style={{ color: colorMap[ev.type] ?? "var(--text2)" }}>
                {ev.type}
              </span>
              <span className="text-[var(--text)] ml-2">{ev.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Experiment Summary ───────────────────────────────────
function ExperimentSummary({
  kit,
  activeMetric,
  activeDirection,
  allFloors,
}: {
  kit: DashboardData["kit"];
  activeMetric: string;
  activeDirection: string;
  allFloors: Record<string, { value: number; direction: string }>;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasContext = kit.context || kit.goals || kit.description;
  if (!hasContext) return null;

  const floorEntries = Object.entries(allFloors);

  return (
    <div className="mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-[0.8rem] font-semibold text-[var(--amber)] uppercase tracking-widest mb-2 pb-1.5 border-b border-[var(--border)] w-full text-left flex items-center gap-2"
      >
        About This Experiment
        <span className="text-xs text-[var(--text3)]">{expanded ? "▼" : "▶"}</span>
      </button>
      {expanded && (
        <div className="border border-[var(--border)] bg-[var(--bg-card)] rounded-md p-4 space-y-3 text-sm">
          {kit.description && (
            <div>
              <div className="text-[0.7rem] uppercase tracking-wider text-[var(--text2)] mb-1">What</div>
              <div className="text-[var(--text)]">{kit.description}</div>
            </div>
          )}
          {kit.goals && (
            <div>
              <div className="text-[0.7rem] uppercase tracking-wider text-[var(--text2)] mb-1">Goal</div>
              <div className="text-[var(--text)]">{kit.goals}</div>
            </div>
          )}
          <div>
            <div className="text-[0.7rem] uppercase tracking-wider text-[var(--text2)] mb-1">What We're Measuring</div>
            <div className="text-[var(--text)]">
              {kit.metric.explanation ? (
                <span>{kit.metric.explanation}</span>
              ) : (
                <>
                  <span className="font-semibold text-[var(--amber)]">{activeMetric}</span>
                  <span className="text-[var(--text2)]"> — {activeDirection} is better</span>
                </>
              )}
            </div>
          </div>
          {floorEntries.length > 0 && (
            <div>
              <div className="text-[0.7rem] uppercase tracking-wider text-[var(--text2)] mb-1">Constraints</div>
              <div className="text-[var(--text)]">
                {floorEntries.map(([name, floor]) => (
                  <div key={name}>
                    {name} must be {floor.direction === "lower" ? "≤" : "≥"} {floor.value}
                  </div>
                ))}
              </div>
            </div>
          )}
          {kit.context && (
            <div>
              <div className="text-[0.7rem] uppercase tracking-wider text-[var(--text2)] mb-1">Context</div>
              <div className="text-[var(--text2)] text-xs leading-relaxed">{kit.context}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Diminishing Returns ──────────────────────────────────
function DiminishingReturns({ values, direction }: { values: number[]; direction: string }) {
  const window = Math.min(10, Math.floor(values.length / 2));
  const recent = values.slice(-window);
  const totalRange = Math.abs(Math.max(...values) - Math.min(...values));
  if (totalRange === 0) return null;

  const recentRange = Math.abs(Math.max(...recent) - Math.min(...recent));
  const recentPct = (recentRange / totalRange) * 100;

  const diffs = recent.slice(1).map((v, i) => v - recent[i]);
  const avgImprovement = direction === "lower"
    ? -(diffs.reduce((a, b) => a + b, 0) / diffs.length)
    : diffs.reduce((a, b) => a + b, 0) / diffs.length;

  let status: "success" | "warning" | "danger";
  let message: string;
  if (recentPct < 5) {
    status = "danger";
    message = "Experiments may be hitting diminishing returns. Recent variation is very small.";
  } else if (recentPct < 15) {
    status = "warning";
    message = "Improvement rate is slowing. Consider trying bolder changes.";
  } else {
    status = "success";
    message = "Experiments are still making meaningful progress.";
  }

  const statusColor = status === "success" ? "var(--green)" : status === "warning" ? "var(--amber)" : "var(--red)";

  return (
    <div className="mb-6">
      <SectionHead>Diminishing Returns</SectionHead>
      <div className="border border-[var(--border)] bg-[var(--bg-card)] rounded-md px-4 py-3 grid grid-cols-[1fr_2fr] gap-4">
        <div>
          <div className="text-[0.7rem] uppercase tracking-wider text-[var(--text2)] mb-1">
            Avg improvement (recent)
          </div>
          <div className="text-xl text-[var(--text)]">{avgImprovement.toFixed(4)} / exp</div>
        </div>
        <div className="flex items-center text-sm" style={{ color: statusColor }}>
          {message}
        </div>
      </div>
    </div>
  );
}
