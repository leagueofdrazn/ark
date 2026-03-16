---
name: ark:help
description: Show available ARK commands and usage guide
allowed-tools:
  - Read
---

<objective>
Display all available ARK (AutoResearch Kit) slash commands with descriptions and usage examples.
</objective>

<process>

Print the following help text exactly:

```
═══════════════════════════════════════════════════════════
  ARK — AutoResearch Kit
  Autonomous research experiments powered by AI
═══════════════════════════════════════════════════════════

  COMMANDS

  /ark:new          Design and scaffold a new experiment
                    Interactive conversation — describe what you want
                    to research, ARK designs the methodology and
                    generates all files.

  /ark:run          Start the autonomous experiment loop
                    Begins the modify → run → evaluate → keep/discard
                    cycle. Runs until you stop it.

  /ark:report       Progress report
                    Results + what they mean for your goal.
                    Teaches you how to read the data along the way.

  /ark:dashboard    Launch the experiment dashboard
                    Opens the Next.js dashboard pointing at the
                    current experiment directory.

  /ark:help         Show this help message

  QUICK START

  1. cd into your project directory
  2. /ark:new              — design your experiment
  3. /ark:run               — start experimenting
  4. /ark:report            — what happened and what does it mean?
  5. /ark:dashboard         — watch progress in browser

  WHAT ARK DOES

  ARK is a companion to Karpathy's autoresearch. You describe
  what you want to research in plain language. ARK figures out
  the right metrics, generates evaluation scripts, and creates
  a complete experiment directory. Then it runs the experiment
  loop autonomously — modifying code, evaluating results, and
  keeping improvements — until you stop it.

  LEARN MORE

  https://github.com/leagueofdrazn/ark
```

</process>
