# {experiment_name} — Agent Context

## What This Is

{experiment_description}

Your job in this session: **{goal_statement}**. Read `program.md` for the full methodology.

## File Map

### MUTABLE — you may modify these
{mutable_files_list}

### IMMUTABLE — do not touch
{immutable_files_list}
- `program.md` — research protocol. Read every session, NEVER modify.
- `laws.md` — autoresearch laws. Read every session, NEVER modify.
- `CLAUDE.md` / `AGENTS.md` — this file. NEVER modify.
- `kit.json` — experiment config. NEVER modify.

### READ — consult these every session
- `laws.md` — the non-negotiable experiment rules. Read FIRST.
- `program.md` — full research methodology. Read during setup.
- `journal.md` — accumulated findings. Confirmed findings, working hypotheses, failed experiments.
- `results.tsv` — full experiment history (keeps, discards, crashes). Scan for patterns.

### WRITE — update these during sessions
{mutable_files_list}
- `results.tsv` — append one row per experiment, every outcome (never commit this file).
- `journal.md` — update when findings are confirmed, emerging, or definitively failed.
- `events.log` — log phase transitions, major insights, session start/end.

## How to Run the Evaluator

```bash
{eval_command}
```

Parse the primary metric from the output:
```bash
{parse_command}
```

Runtime: ~{time_estimate}
{floors_table}

## Keep/Discard Rules

After each experiment:

- **KEEP**: {primary_metric} improved ({direction} is better) → commit stays on branch
- **KEEP (simplicity)**: equal result with simpler code → keep
- **DISCARD**: {primary_metric} same/worse with no simplicity justification → `git reset HEAD~1`
{floors_discard_rule}

## Logging

After every experiment, append one tab-separated row to `results.tsv`:

```
{tsv_header}
```

Use `DISCARDED` as the commit hash for reset experiments.

## Session Start Checklist

1. `git checkout -b {branch_pattern}` (e.g., `{branch_example}`)
2. {data_verify_instruction}
3. Read `journal.md`
4. Read `results.tsv` (last 10 rows: `tail -10 results.tsv`)
5. Read the mutable file(s)
6. Run baseline: `{eval_command}`
7. Log baseline in `results.tsv` and `events.log`
8. Begin experiment loop (see `program.md`)

## Full Methodology

See `program.md` for the complete experiment loop, hypothesis framework, and research protocol.
