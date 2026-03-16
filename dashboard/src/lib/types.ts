export interface Floor {
  value: number;
  direction: "lower" | "higher";
}

export interface Phase {
  name: string;
  metric: string;
  direction: "lower" | "higher";
  gate: { threshold: number; direction: "below" | "above" } | null;
  floors: Record<string, Floor>;
}

export interface MetricConfig {
  primary: string;
  direction: "lower" | "higher";
  floors: Record<string, Floor>;
  phases: Phase[] | null;
  composite_formula: string | null;
}

export interface KitConfig {
  version: number;
  name: string;
  description?: string;
  metric: MetricConfig;
  columns: string[];
  eval_command: string;
  mutable_files: string[];
  immutable_files?: string[];
  time_budget_minutes?: number;
}

export interface Experiment {
  [key: string]: string | number | undefined;
  commit: string;
  status: string;
  description?: string;
}

export interface EventEntry {
  timestamp: string;
  exp_num: number | null;
  type: string;
  description: string;
}

export interface DashboardData {
  kit: KitConfig;
  experiments: Experiment[];
  events: EventEntry[];
  researchActive: boolean;
  currentPhaseIdx: number;
}
