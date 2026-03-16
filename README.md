# AutoResearch Kit (ARK)

A companion to [Karpathy's autoresearch](https://github.com/karpathy/autoresearch) that helps you set up and run autonomous AI research experiments correctly — on any topic, on any hardware.

Describe what you want to research in plain language. ARK designs the experiment, generates the code, and runs it autonomously overnight. You wake up to results you can actually understand.

## Why ARK exists

Karpathy's [autoresearch](https://github.com/karpathy/autoresearch) introduced a powerful idea: give an AI agent a codebase and let it experiment autonomously. Modify, run, evaluate, keep or discard, repeat. Sleep while it works. Wake up to progress.

The hardest part isn't running the experiments — it's setting them up correctly. Choosing the right metric, designing a fair evaluation, knowing what constraints matter, writing a protocol the agent can follow. Get any of these wrong and you waste hours of compute on meaningless results.

ARK solves this by pairing you with an AI researcher that helps you design the experiment correctly, then teaches you what the results mean as they come in:

- **You have a goal, ARK helps you get there.** Describe what you want in plain language — ARK figures out the right metrics, constraints, and methodology.
- **You learn along the way.** ARK explains what it's doing and why, translates results into plain language, and teaches you best practices for interpreting statistical outcomes.
- **You don't need to write a program.md from scratch.** ARK designs it with you through conversation, pushing back if your approach won't work.
- **You don't need to read raw TSV logs.** A live dashboard shows what's happening, and `/ark:report` explains what the numbers mean in context.
- **It works on any hardware.** MacBooks, cloud VMs, GPUs, CPUs — ARK is domain-agnostic.

The core research loop is identical to Karpathy's. ARK wraps it with better onboarding, better visualization, and an educational layer that helps you understand your results.

## Who it's for

- Researchers who want to automate experiments but don't want to write infrastructure
- Developers exploring optimization problems (performance tuning, strategy testing, hyperparameter search)
- Anyone curious about autonomous AI research who doesn't have a GPU or ML background
- Teams already using autoresearch who want better onboarding and visualization

## How it works

ARK has three layers, matching Karpathy's original design:

**1. The protocol** — A set of immutable rules (`laws.md`) that govern how experiments run. These are Karpathy's core laws: the experiment loop, NEVER STOP, timeout handling, crash recovery, the simplicity criterion, and the journal system. They never change.

**2. The experiment design** — Domain-specific configuration (`program.md` + `kit.json`) that describes what you're researching, what metric to optimize, what code the agent can modify, and how to evaluate results. This is what `/ark:new` helps you write.

**3. The dashboard** — A real-time Next.js app that reads experiment logs and shows progress visually. KPI cards, metric charts, floor constraint gauges, event logs, and diminishing returns detection.

## Quick start

### Install

```bash
# Clone the repo
git clone https://github.com/leagueofdrazn/autoresearch-kit.git

# Install the slash commands into Claude Code
cp -r autoresearch-kit/commands/ark ~/.claude/commands/

# Install dashboard dependencies
cd autoresearch-kit/dashboard && npm install
```

### Run

Open Claude Code in any project directory:

```
/ark:new           # Design your experiment (interactive conversation)
/ark:run           # Start the autonomous loop
/ark:report        # Check progress + what it means
/ark:dashboard     # Watch live in browser
```

That's it. No API keys, no Python scripts, no configuration files to write.

## The onboarding conversation

`/ark:new` starts an interactive conversation where Claude acts as an expert researcher. You describe what you want to achieve, and it designs the experiment:

```
/ark:new

════════════════════════════════════════════════════════
  ARK — New Experiment
════════════════════════════════════════════════════════

  I'll help you design an autonomous research experiment.
  Tell me what you want to research and I'll figure out
  the methodology, metrics, and code.

> I want to train a small language model and make it as good
  as possible on a fixed compute budget

  Great — that's a classic scaling efficiency problem. A few questions:

  1. What hardware are you running on?
  2. What data do you want to train on?
  3. How long should each experiment run?

> M4 Max MacBook, whatever public dataset works best, 5 min is fine

  Here's what I'm setting up:

  - Primary metric: val_bpb (validation bits-per-byte) — lower is better
  - Backend: MLX (optimized for Apple Silicon)
  - Data: FineWeb-Edu via HuggingFace
  - Time budget: 5 minutes per experiment

  The agent will modify train.py while prepare.py stays locked.
  Sound good?

> yes

  Experiment ready at experiments/mlx-pretraining/

  Next steps:
    /ark:run          — start the experiment loop
    /ark:dashboard    — watch progress in browser
```

The AI isn't a passive form — it pushes back on bad ideas, chooses the methodology itself, and explains its reasoning in plain language.

## The research loop

Once scaffolded, `/ark:run` follows the standard autoresearch pattern:

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

The agent runs autonomously until you interrupt it. If each experiment takes 5 minutes, that's ~12/hour, ~100 overnight. You wake up to a full log of experiments and a journal of what worked and what didn't.

## The dashboard

`/ark:dashboard` launches a real-time Next.js dashboard:

- KPI cards: best metric, baseline, improvement %, keep rate
- Scatter chart of every experiment colored by status (keep/discard/crash)
- Running best line showing monotonic improvement
- Floor constraint gauges (if configured)
- Phase transition markers (for sequential experiments)
- Event log with timestamps
- Diminishing returns detection
- Light/dark mode, live auto-refresh every 2 seconds

## Understanding your results

`/ark:report` doesn't just show numbers — it teaches you what they mean:

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
  the model generates noticeably more coherent text. The biggest
  win came from switching to rotary position encoding.

  What's working:
  - Rotary embeddings outperform learned positions (confirmed 4x).
    This works because rotary encodings let the model understand
    relative word positions rather than memorizing absolute ones.
  - Smaller batch sizes with more gradient steps improve convergence.

  How to read these results:
  A keep rate of 13% (6 out of 47) is normal — most experiments
  in any research are dead ends. What matters is that each kept
  experiment improved on the last. The last 10 experiments found
  2 gains, which means the agent is still finding improvements
  but they're getting smaller.

  Momentum: Still improving.

  Recent:
    #47  discard  val_bpb=0.9440  wider FFN (4x instead of 3x)
    #46  keep     val_bpb=0.9432  RoPE + reduced warmup steps
    #45  discard  val_bpb=0.9510  lower learning rate 0.001
    ...
════════════════════════════════════════════════════════
```

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

### File roles

| File | Who writes it | Who reads it | Modifiable during experiments? |
|------|--------------|-------------|-------------------------------|
| `laws.md` | ARK (copied verbatim) | Agent | No — immutable, ever |
| `program.md` | Human + ARK together | Agent | No (during runs). Yes (between sessions) |
| `kit.json` | ARK | Dashboard | No |
| `CLAUDE.md` | ARK | Claude Code | No |
| `journal.md` | Agent | Agent | Yes — this is the knowledge base |
| `results.tsv` | Agent | Dashboard + Agent | Yes — append only |
| `events.log` | Agent | Dashboard | Yes — append only |
| Domain code | ARK generates, agent modifies | Agent | Mutable files: yes. Immutable files: no |

## Metric patterns

ARK supports three metric patterns, chosen automatically during onboarding:

**Simple** — One metric to optimize, optional floor constraints.
*Example: minimize val_bpb, or maximize net_sharpe with max_drawdown ≤ 15%*

**Sequential** — Ordered phases where the focus shifts automatically.
*Example: first get val_loss below 2.0, then switch to optimizing val_accuracy*

**Composite** — A formula combining multiple metrics into one scalar.
*Example: optimize throughput / latency*

## Commands

| Command | What it does |
|---------|-------------|
| `/ark:new` | Design and scaffold a new experiment (interactive conversation) |
| `/ark:run` | Start the autonomous experiment loop. Runs until interrupted |
| `/ark:report` | Progress report — results, what they mean, and what you should know |
| `/ark:dashboard` | Launch the visual dashboard in browser |
| `/ark:help` | Show all commands |

## Relationship to Karpathy's autoresearch

ARK is a companion, not a replacement. Here's how the pieces map:

| Karpathy's autoresearch | ARK |
|------------------------|-----|
| `program.md` (hand-written) | `program.md` (generated by `/ark:new`, human-editable) |
| `train.py` (agent modifies) | Domain-specific mutable files (generated per experiment) |
| `prepare.py` (immutable) | Domain-specific immutable files (generated per experiment) |
| `results.tsv` | `results.tsv` (same format) |
| Single GPU, single metric | Any hardware, any metric, any domain |
| Expert researcher writes setup | AI helps non-experts design experiments |
| Read raw TSV logs | Live dashboard + plain-language status reports |

The core protocol is identical. ARK adds: the onboarding conversation, the journal system, `laws.md` (protocol rules separated from domain config), floor constraints, sequential phases, the dashboard, and `/ark:report` for non-expert-friendly results.

## Requirements

- [Claude Code](https://claude.com/claude-code)
- Node.js 18+ (for the dashboard)

No GPU required. No API keys. No Python dependencies for the core tool. Claude Code is the AI researcher.

## Examples

See `examples/` for sample configurations across different domains:

- `examples/ml-pretraining/` — Classic autoresearch (minimize val_bpb)
- `examples/trading-strategy/` — Maximize Sharpe ratio with floor constraints
- `examples/sequential-metrics/` — Phased experiment (convergence then optimization)

These are config examples showing the range of what ARK supports, not runnable experiments.

## Design choices

- **Claude Code native.** No separate Python scripts or API keys. Claude Code IS the researcher.
- **Domain agnostic.** The same tool handles ML training, trading backtests, web optimization, and anything else with a measurable outcome.
- **Protocol separation.** `laws.md` (immutable rules) is separate from `program.md` (domain config). The AI can't weaken the core protocol.
- **Fixed time budget.** Each experiment runs for a fixed duration, making results directly comparable. ~12 experiments/hour, ~100 overnight.
- **Journal system.** Institutional memory across sessions prevents the agent from repeating failed experiments.
- **NEVER STOP.** The agent runs indefinitely until manually interrupted. Go to sleep, wake up to results.

## Credits

Built on [Andrej Karpathy's autoresearch](https://github.com/karpathy/autoresearch). The core research loop — modify, run, evaluate, keep/discard, repeat — is his design. ARK generalizes it to any domain and makes it accessible to non-experts.

Also inspired by [autoresearch-gen](https://github.com/jxnl/autoresearch-gen) for scaffold generation patterns.

## License

MIT
