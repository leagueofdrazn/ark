---
name: ark:run
description: Start the autonomous experiment loop (modify → run → evaluate → keep/discard)
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

<objective>
Start the autonomous research experiment loop. You ARE the researcher. Read the experiment's program.md and follow it exactly — modifying code, running evaluations, keeping improvements, discarding failures, and updating the journal. Run indefinitely until the user interrupts.
</objective>

<process>

## Step 1: Find and Validate Experiment

Look for experiment files in the current directory:
1. Check for `kit.json` in current directory
2. If not found, check for `kit.json` in subdirectories (experiments/*/kit.json)
3. If still not found, error out with: "No experiment found. Run /ark:new first."

Read `kit.json` to understand the experiment config.

## Step 2: Read Context

Read these files in order:
1. `program.md` — the full research protocol. Follow it EXACTLY.
2. `CLAUDE.md` — session context and file map
3. `journal.md` — accumulated knowledge from prior sessions
4. `results.tsv` (last 20 rows) — recent experiment history
6. `events.log` — recent events

## Step 3: Session Setup

Follow the session setup checklist from program.md:
1. Propose a run tag based on today's date
2. Create the experiment branch
3. Verify data exists (if data_verify_command is set)
4. Log SESSION_START to events.log

## Step 4: Run Baseline (if first session)

If `results.tsv` has no data rows (only header), run the baseline:
1. Run the eval command as-is (no modifications)
2. Parse the primary metric
3. Log as baseline in results.tsv and events.log

## Step 5: Experiment Loop

Follow the experiment loop from program.md. This is a FOREVER loop:

1. **Form hypothesis** — based on journal knowledge, prior results, and domain expertise
2. **Modify** the mutable file(s)
3. **git commit** with the hypothesis
4. **Run** the eval command (redirect output to run.log)
5. **Parse** the primary metric
6. **Decide** keep or discard based on the rules in program.md
7. **Log** to results.tsv
8. **Update journal** if significant finding
9. **Log events** if phase gate hit or major insight
10. **Repeat**

**CRITICAL RULES:**
- NEVER STOP to ask the user if you should continue
- If a run crashes, try to fix it (up to 3 attempts per idea), then move on
- If you run out of ideas, think harder — re-read the journal for inspiration, try combining previous near-misses, try more radical changes
- Redirect eval output to run.log — do NOT let it flood your context
- Read only the last 50 lines of run.log to check for errors
- The loop runs until the human interrupts you, period

</process>

<success_criteria>
- [ ] Experiment files found and read
- [ ] Session setup completed (branch, data verification)
- [ ] Baseline established (if first session)
- [ ] Experiment loop running autonomously
- [ ] Results logged to results.tsv after each experiment
- [ ] Journal updated with significant findings
- [ ] Events logged for major milestones
</success_criteria>
