# AutoResearch Kit (ARK)

A companion to [Karpathy's autoresearch](https://github.com/karpathy/autoresearch) that helps you set up and run autonomous AI research experiments correctly — on any topic, on any hardware.

Describe what you want to research in plain language. ARK designs the experiment, generates the code, and runs it autonomously overnight. You wake up to results you can actually understand.

## Why ARK exists

Karpathy's [autoresearch](https://github.com/karpathy/autoresearch) introduced a powerful idea: let the AI be the researcher, not just the engineer. The agent forms hypotheses, tests them, evaluates results, keeps what works, discards what doesn't, and builds knowledge over time. The human becomes the research director — defining what to investigate — while the AI runs hundreds of experiments autonomously. Sleep while it works. Wake up to progress.

The hardest part isn't running the experiments — it's setting them up correctly. Choosing the right metric, designing a fair evaluation, knowing what constraints matter, writing a protocol the agent can follow. Get any of these wrong and you waste hours of compute on meaningless results.

ARK solves this by pairing you with an AI researcher that helps you design the experiment correctly, then teaches you what the results mean as they come in.

## Who it's for

- **You know you need to optimize something, but you're not sure how.** You have a goal — make something faster, more accurate, more profitable — but you don't know what metrics to track or how to design a rigorous test. ARK figures that out with you.
- **You're not a researcher.** You don't need to be. ARK explains what the numbers mean, teaches you how to read the results, and tells you in plain language whether things are working.
- **You want results while you sleep.** Set up an experiment in 15 minutes, let it run overnight, wake up to a report that tells you what happened and what it means.
- **You're already using autoresearch** and want better onboarding, visualization, and a research journal that prevents wasted experiments.

## Getting started

### Install

```bash
curl -fsSL https://raw.githubusercontent.com/leagueofdrazn/ark/main/install.sh | sh
```

The installer auto-detects your runtimes and installs for each one. Verify with:

- Claude Code / Copilot: `/ark:help`
- Gemini: `/ark:help`
- Codex: `$ark-help`

### Requirements

- An AI coding agent: [Claude Code](https://claude.com/claude-code), [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Codex CLI](https://github.com/openai/codex), or [GitHub Copilot](https://github.com/features/copilot)
- Node.js 18+ (for the dashboard)

No GPU required. No API keys.

### Recommended: Skip Permissions Mode

ARK is designed for autonomous overnight experiments. Run your agent with permissions disabled:

```bash
# Claude Code
claude --dangerously-skip-permissions

# Gemini
gemini --yolo

# Codex
codex --full-auto
```

> **Tip:** This is how ARK is intended to be used — stopping to approve every `git commit` and `python train.py` across 100 experiments overnight defeats the purpose.

### Staying updated

Re-run the same command to update:

```bash
curl -fsSL https://raw.githubusercontent.com/leagueofdrazn/ark/main/install.sh | sh
```

## Commands

```
/ark:new           # Design your experiment (this is the only setup step)
/ark:run           # Start the autonomous loop (go to sleep)
/ark:report        # Wake up — what happened and what does it mean?
/ark:dashboard     # Watch live in browser
/ark:help          # Show all commands
```

`/ark:new` is the only setup step — describe your goal and ARK designs everything. After that, you can use slash commands or just ask your agent directly. Ask "how's my experiment going?" and it reads the experiment files and answers.

## How it works

### 1. Onboarding

`/ark:new` starts a conversation where you describe your goal. The AI designs everything else — metrics, evaluation code, data strategy, time budget. It detects your hardware, pushes back if your approach won't work, and explains what it's doing in plain language. You confirm the design, and it scaffolds the entire experiment.

### 2. The research loop

`/ark:run` starts the autonomous experiment loop:

```
LOOP FOREVER:
  1. Form hypothesis
  2. Modify the mutable file(s)
  3. git commit
  4. Run the evaluator
  5. Parse the metric
  6. Keep or discard (git reset if worse)
  7. Log to results.tsv + update journal
  8. Repeat
```

The agent runs autonomously until you interrupt it. You wake up to a full log of experiments and a journal of what worked and what didn't.

### 3. The dashboard

`/ark:dashboard` launches a real-time Next.js dashboard with KPI cards, metric progression charts, floor constraint gauges, event logs, diminishing returns detection, and light/dark mode. Auto-refreshes every 2 seconds.

### 4. Understanding your results

`/ark:report` translates numbers into plain language tied to your original goal. It teaches you how to interpret what you're seeing:

```
/ark:report

════════════════════════════════════════════════════════
  ARK Report — mlx-pretraining
  Mar 17 · 47 experiments
════════════════════════════════════════════════════════

  Your goal:
  Train the best language model possible on an M4 Max MacBook
  with a 5-minute compute budget per experiment.

  val_bpb
    Best:        0.9432  (experiment #41)
    Baseline:    0.9979
    Improvement: +5.5%

  What this means:
  val_bpb (bits per byte) measures how well the model predicts
  text — lower means better predictions. A 5.5% improvement means
  the model generates noticeably more coherent text.

  What's working:
  - Rotary embeddings outperform learned positions (confirmed 4x)
  - Smaller batch sizes with more gradient steps improve convergence

  How to read these results:
  A keep rate of 13% (6 out of 47) is normal — most experiments
  in any research are dead ends. What matters is that each kept
  experiment improved on the last.

  Momentum: Still improving.
════════════════════════════════════════════════════════
```

## Run multiple experiments at once

Each `/ark:new` creates an isolated experiment directory. Open multiple sessions in different directories and run `/ark:run` in each — they won't interfere with each other. Each has its own results, journal, and dashboard.

## What gets generated

`/ark:new` creates a complete experiment directory:

```
your-experiment/
├── kit.json          # Config (dashboard reads this)
├── program.md        # Research protocol (domain-specific, human-editable)
├── laws.md           # Autoresearch laws (immutable protocol rules)
├── CLAUDE.md         # Session instructions + file permissions
├── journal.md        # Knowledge base (confirmed/working/failed findings)
├── results.tsv       # Full experiment history
├── events.log        # System events (phase transitions, insights)
├── .gitignore
├── pyproject.toml    # Dependencies
└── [domain files]    # Training script, evaluator, data prep, etc.
```

| File | Who writes it | Modifiable during experiments? |
|------|--------------|-------------------------------|
| `laws.md` | ARK (copied verbatim) | No — immutable, ever |
| `program.md` | Human + ARK together | No during runs. Yes between sessions |
| `kit.json` | ARK | No |
| `journal.md` | Agent | Yes — this is the knowledge base |
| `results.tsv` | Agent | Yes — append only |
| Domain code | ARK generates, agent modifies | Mutable files: yes. Immutable files: no |

## Metric patterns

ARK supports three metric patterns, chosen automatically during onboarding:

**Simple** — One metric to optimize, optional floor constraints.
*Example: minimize val_bpb, or maximize net_sharpe with max_drawdown ≤ 15%*

**Sequential** — Ordered phases where the focus shifts automatically.
*Example: first get val_loss below 2.0, then switch to optimizing val_accuracy*

**Composite** — A formula combining multiple metrics into one scalar.
*Example: optimize throughput / latency*

## Relationship to Karpathy's autoresearch

ARK is a companion, not a replacement.

| Karpathy's autoresearch | ARK |
|------------------------|-----|
| `program.md` (hand-written) | `program.md` (generated by `/ark:new`, human-editable) |
| `train.py` (agent modifies) | Domain-specific mutable files (generated per experiment) |
| `prepare.py` (immutable) | Domain-specific immutable files (generated per experiment) |
| `results.tsv` | `results.tsv` (same format) |
| Expert researcher writes setup | AI helps you design the experiment |
| Read raw TSV logs | Live dashboard + plain-language reports |

ARK adds: the onboarding conversation, the journal system, `laws.md` (protocol rules separated from domain config), floor constraints, sequential phases, the dashboard, and `/ark:report` for non-expert-friendly results. The core protocol is identical.

## Design choices

- **Agent-agnostic.** Slash commands work with Claude Code, Gemini, Codex, and Copilot. The generated experiments work with any AI coding agent.
- **Domain agnostic.** The same tool handles ML training, trading backtests, web optimization, and anything else with a measurable outcome.
- **Protocol separation.** `laws.md` (immutable rules) is separate from `program.md` (domain config). The AI can't weaken the core protocol.
- **Journal system.** Institutional memory across sessions prevents the agent from repeating failed experiments.
- **NEVER STOP.** The agent runs indefinitely until manually interrupted. Go to sleep, wake up to results.

## Examples

See `examples/` for sample configurations across different domains:

- `examples/ml-pretraining/` — Classic autoresearch (minimize val_bpb)
- `examples/trading-strategy/` — Maximize Sharpe ratio with floor constraints
- `examples/sequential-metrics/` — Phased experiment (convergence then optimization)

These are config examples showing the range of what ARK supports, not runnable experiments.

## Credits

Built on [Andrej Karpathy's autoresearch](https://github.com/karpathy/autoresearch). The core research loop — modify, run, evaluate, keep/discard, repeat — is his design. ARK generalizes it to any domain and makes it accessible to non-experts.

Also inspired by [autoresearch-gen](https://github.com/jxnl/autoresearch-gen) for scaffold generation patterns.

## License

MIT
