import fs from "fs";
import path from "path";
import type {
  DashboardData,
  EventEntry,
  Experiment,
  KitConfig,
} from "./types";

/**
 * Resolve the experiment directory.
 *
 * Priority:
 *  1. EXP_DIR environment variable
 *  2. ../experiments/<first-dir-with-kit.json>
 *  3. ../ (parent of dashboard/)
 */
function resolveExpDir(): string {
  if (process.env.EXP_DIR) return path.resolve(process.env.EXP_DIR);

  const parent = path.resolve(process.cwd(), "..");

  // Check for experiments/ subdirectories
  const expDir = path.join(parent, "experiments");
  if (fs.existsSync(expDir)) {
    try {
      const dirs = fs.readdirSync(expDir, { withFileTypes: true });
      for (const d of dirs) {
        if (d.isDirectory() && fs.existsSync(path.join(expDir, d.name, "kit.json"))) {
          return path.join(expDir, d.name);
        }
      }
    } catch {}
  }

  // Fallback: parent directory
  if (fs.existsSync(path.join(parent, "kit.json"))) return parent;

  return parent;
}

const EXP_DIR = resolveExpDir();

function filePath(...parts: string[]): string {
  return path.join(EXP_DIR, ...parts);
}

function readFileOr(p: string, fallback: string): string {
  try {
    return fs.readFileSync(p, "utf-8");
  } catch {
    return fallback;
  }
}

export function readKit(): KitConfig | null {
  const raw = readFileOr(filePath("kit.json"), "");
  if (!raw.trim()) return null;
  try {
    return JSON.parse(raw) as KitConfig;
  } catch {
    return null;
  }
}

export function readExperiments(kit: KitConfig): Experiment[] {
  const raw = readFileOr(filePath("results.tsv"), "");
  if (!raw.trim()) return [];

  const lines = raw.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split("\t");
  return lines.slice(1).map((line) => {
    const vals = line.split("\t");
    const row: Record<string, string | number | undefined> = {};
    headers.forEach((h, i) => {
      const v = vals[i] ?? "";
      if (h === "commit" || h === "status" || h === "description") {
        row[h] = v;
      } else if (v === "" || v === "-") {
        row[h] = undefined;
      } else {
        const num = parseFloat(v);
        row[h] = isNaN(num) ? v : num;
      }
    });
    return row as Experiment;
  });
}

export function readEvents(): EventEntry[] {
  const raw = readFileOr(filePath("events.log"), "");
  if (!raw.trim()) return [];

  const events: EventEntry[] = [];
  for (const line of raw.trim().split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Support formats:
    //   [YYYY-MM-DD HH:MM:SS] [exp#NNN] TYPE: description
    //   YYYY-MM-DDTHH:MM:SS NNN TYPE description
    const bracketMatch = trimmed.match(
      /^\[([^\]]+)\]\s*(?:\[exp#(\d+)\])?\s*(\w+):?\s*(.*)/
    );
    if (bracketMatch) {
      events.push({
        timestamp: bracketMatch[1],
        exp_num: bracketMatch[2] ? parseInt(bracketMatch[2]) : null,
        type: bracketMatch[3],
        description: bracketMatch[4],
      });
      continue;
    }

    const parts = trimmed.split(/\s+/);
    if (parts.length < 3) continue;
    const timestamp = parts[0];
    let exp_num: number | null = null;
    let type: string;
    let description: string;

    const maybeNum = parseInt(parts[1]);
    if (!isNaN(maybeNum)) {
      exp_num = maybeNum;
      type = parts[2] ?? "INFO";
      description = parts.slice(3).join(" ");
    } else {
      type = parts[1];
      description = parts.slice(2).join(" ");
    }
    events.push({ timestamp, exp_num, type, description });
  }
  return events;
}

export function isResearchActive(): boolean {
  try {
    const stat = fs.statSync(filePath("results.tsv"));
    return Date.now() - stat.mtimeMs < 5 * 60 * 1000;
  } catch {
    return false;
  }
}

function countPhaseGates(events: EventEntry[]): number {
  return events.filter((e) => e.type === "PHASE_GATE").length;
}

export function loadAll(): DashboardData {
  const kit = readKit();
  if (!kit) {
    return {
      kit: {
        version: 1,
        name: "No experiment",
        metric: { primary: "metric", direction: "lower", floors: {}, phases: null, composite_formula: null },
        columns: [],
        eval_command: "",
        mutable_files: [],
      },
      experiments: [],
      events: [],
      researchActive: false,
      currentPhaseIdx: -1,
    };
  }

  const events = readEvents();
  const experiments = readExperiments(kit);
  const phases = kit.metric.phases;
  const currentPhaseIdx = phases
    ? Math.min(countPhaseGates(events), phases.length - 1)
    : -1;

  return {
    kit,
    experiments,
    events,
    researchActive: isResearchActive(),
    currentPhaseIdx,
  };
}
