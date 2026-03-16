"""
kit.json schema definition and validation.

kit.json is THE contract between onboarding (/ark:new) and the dashboard.
Onboarding writes it, dashboard reads it. This module validates both sides.
"""

import json
import os

# ---------------------------------------------------------------------------
# Schema reference (for documentation — actual validation below)
# ---------------------------------------------------------------------------
#
# {
#   "version": 1,
#   "name": "experiment-name",
#   "description": "What this experiment is about",
#   "created_at": "2026-03-16T10:00:00Z",
#
#   -- Metric system (one of three patterns) --
#
#   "metric": {
#     "primary": "val_bpb",           # name of the primary metric
#     "direction": "lower",           # "lower" or "higher" is better
#
#     # Pattern 1: Simple (primary + optional floors)
#     "floors": {                     # optional hard constraints
#       "max_drawdown": { "value": 0.15, "direction": "lower" },
#       "win_rate": { "value": 0.40, "direction": "higher" }
#     },
#
#     # Pattern 2: Sequential phases (optional, overrides primary when present)
#     "phases": [                     # ordered list, agent auto-transitions
#       {
#         "name": "convergence",
#         "metric": "val_loss",
#         "direction": "lower",
#         "gate": { "threshold": 2.0, "direction": "below" },
#         "floors": {}
#       },
#       {
#         "name": "optimization",
#         "metric": "val_accuracy",
#         "direction": "higher",
#         "gate": null,               # null = final phase, no gate
#         "floors": { "val_loss": { "value": 2.5, "direction": "lower" } }
#       }
#     ],
#
#     # Pattern 3: Composite (optional, formula combining metrics into one scalar)
#     "composite_formula": null       # e.g. "throughput / latency" or null
#   },
#
#   -- Experiment structure --
#
#   "eval_command": "uv run train.py",        # how to run one experiment
#   "parse_metric": "grep '^val_bpb:' run.log",  # how to extract primary metric
#   "mutable_files": ["train.py"],            # what the agent can modify
#   "immutable_files": ["prepare.py"],        # what must not be touched
#   "read_files": ["program.md", "journal.md"],  # what to read each session
#   "write_files": ["results.tsv", "journal.md"],  # what the agent updates
#
#   -- Logging --
#
#   "columns": [                              # TSV column schema
#     "commit", "val_bpb", "memory_gb", "status", "description"
#   ],
#   "status_values": ["baseline", "keep", "discard", "crash"],
#
#   -- Environment --
#
#   "time_budget_minutes": 5,                 # wall-clock per experiment
#   "timeout_minutes": 10,                    # kill threshold
#   "data_description": "HuggingFace fineweb-edu, first 10 shards",
#   "data_verify_command": "ls ~/.cache/autoresearch/",  # smoke test for data
#   "branch_pattern": "autoresearch/{tag}",   # git branch naming
#
#   -- Context (for program.md rendering) --
#
#   "context": "Small GPT pretraining on Apple Silicon",
#   "goals": "Minimize validation bits-per-byte",
#   "preferences": "Start with 8 layers, MLX backend"
# }


REQUIRED_FIELDS = ["version", "name", "metric", "eval_command", "mutable_files", "columns"]

VALID_DIRECTIONS = {"lower", "higher"}
VALID_GATE_DIRECTIONS = {"below", "above"}


def load(path):
    """Load and validate a kit.json file. Returns the parsed dict."""
    with open(path) as f:
        kit = json.load(f)
    validate(kit)
    return kit


def save(kit, path):
    """Validate and save a kit.json file."""
    validate(kit)
    with open(path, "w") as f:
        json.dump(kit, f, indent=2)
        f.write("\n")


def validate(kit):
    """Validate a kit config dict. Raises ValueError on problems."""
    errors = []

    for field in REQUIRED_FIELDS:
        if field not in kit:
            errors.append(f"Missing required field: {field}")

    if errors:
        raise ValueError("kit.json validation failed:\n" + "\n".join(f"  - {e}" for e in errors))

    # Version
    if kit.get("version") != 1:
        errors.append(f"Unsupported version: {kit.get('version')} (expected 1)")

    # Metric block
    metric = kit.get("metric", {})
    if not isinstance(metric, dict):
        errors.append("'metric' must be an object")
    else:
        _validate_metric(metric, errors)

    # Columns must include status
    columns = kit.get("columns", [])
    if "status" not in columns:
        errors.append("'columns' must include 'status'")
    if "commit" not in columns:
        errors.append("'columns' must include 'commit'")

    # Mutable files
    if not kit.get("mutable_files"):
        errors.append("'mutable_files' must have at least one entry")

    if errors:
        raise ValueError("kit.json validation failed:\n" + "\n".join(f"  - {e}" for e in errors))


def _validate_metric(metric, errors):
    """Validate the metric block."""
    # Must have primary + direction (unless phases are defined)
    phases = metric.get("phases")

    if phases:
        # Sequential mode — validate each phase
        if not isinstance(phases, list) or len(phases) < 2:
            errors.append("'metric.phases' must be a list with at least 2 phases")
            return

        for i, phase in enumerate(phases):
            if not phase.get("name"):
                errors.append(f"Phase {i}: missing 'name'")
            if not phase.get("metric"):
                errors.append(f"Phase {i}: missing 'metric'")
            if phase.get("direction") not in VALID_DIRECTIONS:
                errors.append(f"Phase {i}: 'direction' must be 'lower' or 'higher'")

            gate = phase.get("gate")
            if gate is not None:
                if "threshold" not in gate:
                    errors.append(f"Phase {i}: gate missing 'threshold'")
                if gate.get("direction") not in VALID_GATE_DIRECTIONS:
                    errors.append(f"Phase {i}: gate 'direction' must be 'below' or 'above'")
            elif i < len(phases) - 1:
                errors.append(f"Phase {i}: only the last phase can have gate=null")

            # Validate phase floors
            _validate_floors(phase.get("floors", {}), f"Phase {i}", errors)

        # In sequential mode, primary/direction come from the first phase
        if "primary" not in metric:
            metric["primary"] = phases[0]["metric"]
        if "direction" not in metric:
            metric["direction"] = phases[0]["direction"]
    else:
        # Simple or composite mode
        if not metric.get("primary"):
            errors.append("'metric.primary' is required")
        if metric.get("direction") not in VALID_DIRECTIONS:
            errors.append("'metric.direction' must be 'lower' or 'higher'")

    # Validate top-level floors
    _validate_floors(metric.get("floors", {}), "metric", errors)

    # Validate composite formula (just check it's a string if present)
    formula = metric.get("composite_formula")
    if formula is not None and not isinstance(formula, str):
        errors.append("'metric.composite_formula' must be a string or null")


def _validate_floors(floors, context, errors):
    """Validate a floors dict."""
    if not isinstance(floors, dict):
        errors.append(f"{context}: 'floors' must be an object")
        return
    for name, floor in floors.items():
        if not isinstance(floor, dict):
            errors.append(f"{context}: floor '{name}' must be an object")
            continue
        if "value" not in floor:
            errors.append(f"{context}: floor '{name}' missing 'value'")
        if floor.get("direction") not in VALID_DIRECTIONS:
            errors.append(f"{context}: floor '{name}' direction must be 'lower' or 'higher'")


def get_current_phase(kit, events_log_path=None):
    """Determine the current active phase from kit config and events log.

    Returns (phase_dict, phase_index) or (None, -1) if not using phases.
    """
    phases = kit.get("metric", {}).get("phases")
    if not phases:
        return None, -1

    # Default to first phase
    current_index = 0

    # Check events log for phase transitions
    if events_log_path and os.path.isfile(events_log_path):
        with open(events_log_path) as f:
            for line in f:
                if "PHASE_GATE" in line:
                    # Each PHASE_GATE event advances to the next phase
                    current_index += 1

    # Clamp to valid range
    current_index = min(current_index, len(phases) - 1)
    return phases[current_index], current_index


def get_active_metric(kit, events_log_path=None):
    """Get the currently active metric name and direction.

    Accounts for phase transitions in sequential experiments.
    Returns (metric_name, direction).
    """
    phase, _ = get_current_phase(kit, events_log_path)
    if phase:
        return phase["metric"], phase["direction"]

    metric = kit.get("metric", {})
    return metric.get("primary", "metric"), metric.get("direction", "lower")


def get_all_floors(kit, events_log_path=None):
    """Get all active floor constraints for the current phase.

    Merges top-level floors with phase-specific floors.
    Returns dict of {metric_name: {value, direction}}.
    """
    metric = kit.get("metric", {})
    floors = dict(metric.get("floors", {}))

    phase, _ = get_current_phase(kit, events_log_path)
    if phase:
        floors.update(phase.get("floors", {}))

    return floors
