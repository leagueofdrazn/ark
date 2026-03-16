---
name: ark:report
description: Progress report — results, what they mean, and what you should know
allowed-tools:
  - Read
  - Bash
  - Glob
---

<objective>
Generate a progress report that does two things: (1) show the user where their experiment stands, and (2) teach them what the results mean. The user may not be an expert — your job is to make them smarter about their own experiment. Translate everything to plain language, explain the statistical concepts behind your assessments, and connect every number back to their original goal. This is a snapshot, not a conclusion.
</objective>

<process>

## Step 1: Find the experiment

Look for `kit.json`:
1. Current directory
2. Any `experiments/*/kit.json` subdirectory
3. If not found: "No experiment found. Run /ark:new first."

## Step 2: Load everything

Read:
- `kit.json` — original goal, description, metric, direction, floors
- `results.tsv` — full experiment history
- `events.log` — major events
- `journal.md` — confirmed findings, working/failed hypotheses
- `program.md` — the context and goals sections

## Step 3: Compute stats

From results.tsv:
- Total experiments, keep count, discard count, crash count
- Keep rate %
- Baseline value, best value, improvement %
- Current dry streak (experiments since last keep)
- Recent trajectory: are the last 10 experiments still improving or flatlining?
- Best experiment's description (what change produced the best result)

From journal.md:
- Count of confirmed findings, working hypotheses, failed hypotheses
- Most important confirmed finding

If phases: current phase, gate progress
If floors: which are satisfied, which are not

## Step 4: Print the report

```
════════════════════════════════════════════════════════
  ARK Report — <experiment_name>
  <date> · <N> experiments
════════════════════════════════════════════════════════
```

### Flags
If there are any `FLAG` events in events.log, show them FIRST — before anything else. These are the agent's recommendations that need human attention. Present each flag clearly:

```
  FLAGS (agent recommendations):
  ⚑ [timestamp] <description>
  ⚑ [timestamp] <description>
```

If there are no flags, skip this section entirely.

### Your goal
Restate what the user asked for from kit.json context/goals in their own words. Remind them where this started.

### Numbers
Show the raw metrics:
```
  Status:        <ACTIVE / IDLE>
  Experiments:   <N> total (<K> kept, <D> discarded, <C> crashed)
  Keep Rate:     <X>%

  <metric>
    Best:        <value>  (experiment #<N>)
    Baseline:    <value>
    Improvement: <+X.X%>

  [Phase:       <N>/<total> — <phase_name>]
  [Gate:        <MET / X.XXXX to go>]
  [Floors:      <all met / N violated>]
```

### What this means
Translate the numbers into real-world impact tied to their goal. Do NOT just restate the metrics — explain what the improvement means practically. If relevant, explain the metric itself in layman's terms (e.g. "Sharpe ratio measures return per unit of risk — a Sharpe of 1.5 means you earn $1.50 for every $1 of uncertainty you take on").

### What's working
Top 2-3 confirmed findings from the journal. Explain WHY they work in simple terms so the user builds intuition about their domain.

### What's not working
Top failed hypotheses. Explain why they failed — this teaches the user what doesn't work and why, so they develop better instincts about what to suggest if they want to guide the experiment.

### How to read these results
Teach the user how to interpret what they're seeing. This section changes based on the data:

- **Keep rate context**: "A keep rate of 15% is normal — most experiments in any research are dead ends. What matters is that the keeps are getting better over time."
- **Diminishing returns**: "The last 20 experiments moved the metric by only 0.002. This is called diminishing returns — each improvement gets harder to find. It doesn't mean the experiment failed, it means you're approaching the ceiling of what this approach can achieve."
- **Variance**: "The metric jumped from 0.94 to 0.97 then back to 0.93. This volatility is normal early on — the agent is exploring broadly. It typically stabilizes as it narrows in on what works."
- **Floor constraints**: "All three floor constraints are met. This means the result isn't just good on paper — it meets the real-world safety requirements you defined."
- **Crash rate**: "12 out of 47 experiments crashed (25%). That's higher than typical. Most crashes are the agent trying aggressive changes that break the code — it fixes them and moves on. This is normal but worth watching."

Tailor this to what the data actually shows. Don't include sections that aren't relevant.

### Momentum
Honest assessment:
- **Still improving** — recent experiments are finding gains
- **Diminishing returns** — improvements have slowed significantly
- **Stuck** — no improvement in N experiments

### Recent experiments (last 5)
```
  #<N>  <status>  <metric>=<value>  <description>
```

```
════════════════════════════════════════════════════════
  /ark:run          — continue experimenting
  /ark:dashboard    — watch progress in browser
════════════════════════════════════════════════════════
```

## Key rules

- NEVER use jargon without explaining it in the same sentence
- ALWAYS connect numbers back to the user's original goal
- TEACH the user — explain WHY things work, not just WHAT happened
- Be honest about diminishing returns — don't hype mediocre results
- This is a snapshot, not a conclusion
- The goal is for the user to finish reading this report SMARTER about their experiment than when they started

</process>
