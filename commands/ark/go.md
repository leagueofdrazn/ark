---
name: ark:go
description: Launch dashboard + start experiment loop in one command
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

<objective>
Launch the ARK dashboard and start the autonomous experiment loop — all in one command. The dashboard starts in the background, then the experiment loop takes over.
</objective>

<ux-rules>
**Do not narrate setup steps.** Silently find the experiment, launch the dashboard, and start the loop. The user should see the dashboard URL and then experiment output — nothing else.
</ux-rules>

<process>

## Step 1: Find the Experiment (SILENT)

Look for `kit.json`:
1. Current directory
2. `experiments/*/kit.json` subdirectories
3. Error out: "No experiment found. Run /ark:new first."

Store the absolute experiment path as EXP_DIR.

## Step 2: Launch Dashboard (SILENT)

Find the ARK dashboard:
1. Check `./dashboard/package.json` (inside ARK repo)
2. Check `~/.ark/dashboard/`
3. If not found, skip the dashboard and warn: "Dashboard not found — running experiment only."

If found, launch in the background and let Next.js auto-select a port if 3000 is taken:
```bash
cd <dashboard_dir> && EXP_DIR=<absolute_exp_dir> npm run dev &
```

Wait a few seconds, then check the output for the actual port (Next.js prints `- Local: http://localhost:XXXX`). Print one line with the correct port:
```
Dashboard: http://localhost:<port>
```

## Step 3: Start Experiment Loop

Now follow the exact same process as /ark:run — read context, set up session, run the experiment loop forever. Everything from /ark:run applies here:

1. Read `kit.json`, `program.md`, `CLAUDE.md`, `journal.md`, `results.tsv` (last 20 rows), `events.log`
2. Session setup: propose run tag, create branch, verify data, log SESSION_START
3. Run baseline if first session
4. Enter the forever loop: hypothesis → modify → commit → run → parse → keep/discard → log → repeat

**CRITICAL RULES:**
- NEVER STOP to ask the user if you should continue
- If a run crashes, try to fix it (up to 3 attempts per idea), then move on
- If you run out of ideas, think harder — re-read the journal for inspiration, try combining previous near-misses, try more radical changes
- Redirect eval output to run.log — do NOT let it flood your context
- Read only the last 50 lines of run.log to check for errors
- The loop runs until the human interrupts you, period

**KEEP OUTPUT CLEAN:**
- Use `git add -q` and `git commit -q` to suppress git noise
- Suppress or redirect verbose command output (e.g. `> /dev/null 2>&1` for commands where you don't need the output)
- After each experiment, print a single clean summary line, e.g.:
  ```
  #3 KEEP  peak_rss_mb: 361.53 (-61%)  "Load only needed columns + del intermediates"
  #4 DISCARD  peak_rss_mb: 415.95  output_correct: false  "Categorical dtypes + float32"
  ```
- Do NOT print raw git stats, file change counts, or full command output. The user should see a clean experiment log, not tool noise.

</process>

<success_criteria>
- [ ] Dashboard launched in background
- [ ] Experiment files found and read
- [ ] Session setup completed (branch, data verification)
- [ ] Baseline established (if first session)
- [ ] Experiment loop running autonomously
- [ ] Results logged to results.tsv after each experiment
- [ ] Journal updated with significant findings
</success_criteria>
