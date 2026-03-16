# autoresearch

This is an experiment to have the LLM do its own research.

## Project Context

{context}

## Data

{data_description}

## Research Goals

{goals}

## Metric System

**Primary metric:** `{primary_metric}` ({direction} is better)
{floors_section}
{phases_section}

## Config

- **Tag:** {tag}
- **Time budget:** {time_budget_min} minutes per experiment

## Setup

To set up a new experiment session, work with the user to:

1. **Agree on a run tag**: propose a tag based on today's date (e.g. `mar16`). The branch `{branch_pattern}` must not already exist — this is a fresh run.
2. **Create the branch**: `git checkout -b {branch_pattern}` from current master.
3. **Read the in-scope files**: Read these files for full context:
{read_files_list}
4. **Verify data exists**: {data_verify_instruction}
5. **Initialize logs**: Create `results.tsv` with just the header row if it doesn't exist. The baseline will be recorded after the first run.
6. **Read the journal**: Read `journal.md` for accumulated knowledge — confirmed findings, working hypotheses, and failed experiments from prior sessions. Build on what's known. Do NOT retry failed hypotheses unless you have a specific new reason.
7. **Read `laws.md`**: The experiment laws are non-negotiable. Read and follow them exactly.
8. **Confirm and go**: Confirm setup looks good.

Once you get confirmation, kick off the experimentation.

## Experimentation

Each experiment runs with a **fixed time budget of {time_budget_min} minutes** (wall clock). You launch it as: `{eval_command}`.

**What you CAN do:**
{can_do_section}

**What you CANNOT do:**
{cannot_do_section}

**The goal is simple: get the {direction_text} `{primary_metric}`.** Since the time budget is fixed, you don't need to worry about runtime. Everything within the mutable files is fair game. The only constraint is that the code runs without crashing and finishes within the time budget.
{floors_criterion}
{phases_instructions}

## Output Format

When the evaluator finishes it prints results in this format:

```
{output_format_example}
```

Extract the key metric:

```
{parse_command}
```

## TSV Columns

```
{tsv_header}
```

{columns_description}

## Laws

**The experiment loop, NEVER STOP mandate, timeout rules, crash handling, simplicity criterion, logging format, events log format, and journal protocol are defined in `laws.md`. These are non-negotiable and must not be modified. Read and follow them exactly.**
