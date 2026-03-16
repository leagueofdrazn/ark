<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- AUTORESEARCH LAWS — DO NOT MODIFY                                 -->
<!-- These rules are fundamental to the autoresearch pattern.          -->
<!-- They are NOT configurable. They are NOT negotiable.               -->
<!-- Any agent session that violates these laws is broken.             -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## The Experiment Loop

LOOP FOREVER:

1. **Form a hypothesis**: State what you're changing and why. Be specific: "H: [change] → expect [metric] to [improve/worsen] because [reason]"
2. **Modify** the mutable file(s) with your experimental change.
3. **git commit** with the hypothesis as the message.
4. **Run** the evaluator, redirecting output: `[eval_command] > run.log 2>&1` (do NOT let output flood your context)
5. **Extract results** from the log.
6. If the output is empty, the run crashed. Run `tail -n 50 run.log` to read the error and attempt a fix. If you can't fix after 3 attempts, give up on this idea.
7. **Record** the results in `results.tsv` (see Logging below).
8. If the primary metric improved, you "advance" the branch — keep the git commit.
9. If the primary metric is equal or worse, `git reset HEAD~1` to discard.
10. **Update journal**: If this experiment reveals something significant (confirmed a hypothesis, found a new pattern, definitively failed), update `journal.md`.
11. **Log events**: If a phase gate was hit, or a major insight was found, append to `events.log`.
12. **Repeat**.

## NEVER STOP

Once the experiment loop has begun, do NOT pause to ask the human if you should continue. Do NOT ask "should I keep going?" or "is this a good stopping point?". The human might be asleep or away and expects you to continue working *indefinitely* until manually stopped. You are autonomous. If you run out of ideas, think harder — re-read the journal for inspiration, try combining previous near-misses, try more radical changes. The loop runs until the human interrupts you, period.

## Timeout

Each experiment has a fixed time budget. If a run exceeds double the time budget, kill it and treat it as a failure (discard and revert).

## Crashes

If a run crashes, use your judgment: if it's trivially fixable (typo, missing import), fix and re-run. If the idea itself is fundamentally broken, log "crash" and move on. Do not spend more than 3 attempts fixing a single crash.

## Simplicity Criterion

All else being equal, simpler is better. A small improvement that adds ugly complexity is not worth it. Conversely, removing something and getting equal or better results is a great outcome — that's a simplification win. When evaluating whether to keep a change, weigh the complexity cost against the improvement magnitude.

## The First Run

Your very first run should always be to establish the baseline, so you will run the evaluator as-is before making any changes.

## Logging Results

Log every experiment to `results.tsv` — keeps, discards, and crashes. This is the complete record. Use tabs, NOT commas — commas break in descriptions.

### Rules

- Append one row after EVERY experiment, regardless of outcome.
- Do NOT commit results.tsv — leave it untracked by git.
- Keep the header row consistent.
- You can add extra columns — the dashboard auto-detects any numeric column as a metric.

## Events Log

Log significant events to `events.log` in this format:

```
[YYYY-MM-DD HH:MM:SS] [exp#NNN] EVENT_TYPE: description
```

Event types:
- `SESSION_START` — new session begins (log tag, baseline metric)
- `BASELINE` — baseline established (log metric value)
- `PHASE_GATE` — phase transition triggered (log old metric, new target, reason)
- `METRIC_SWITCH` — primary metric changed (log old→new)
- `INSIGHT` — significant finding worth highlighting (log what was learned)
- `SESSION_END` — session complete (log final best, experiments run, keeps)

## Journal Protocol

The journal (`journal.md`) is your institutional memory across sessions. Update it during the experiment loop:

**Confirmed Findings** (3+ validations): Treat as ground truth. Build on these. Never contradict without extraordinary evidence.

**Working Hypotheses** (1-2 validations): Promising but unproven. Try to confirm or refute.

**Failed Hypotheses**: Definitively failed. Include the specific reason. Do NOT retry without a documented reason why this time would be different.

The promotion lifecycle:
- New experiment succeeds → add to Working Hypotheses
- Working Hypothesis validated 2+ more times → promote to Confirmed Finding
- Any experiment fails → add to Failed Hypotheses with reason

This prevents you from wasting time on ideas that have already been tried and failed.
