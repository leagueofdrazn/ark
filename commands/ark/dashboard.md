---
name: ark:dashboard
description: Launch the experiment dashboard in the browser
allowed-tools:
  - Read
  - Bash
  - Glob
---

<objective>
Launch the ARK Next.js dashboard pointing at the current experiment directory.
</objective>

<process>

## Step 1: Find the experiment

Look for `kit.json` to determine the experiment directory:
1. Current directory
2. Any `experiments/*/kit.json` subdirectory
3. Ask user if not found

Store the absolute path as EXP_DIR.

## Step 2: Find the dashboard

Look for the ARK dashboard:
1. Check `./dashboard/package.json` (inside ARK repo)
2. Check `~/Documents/GitHub/autoresearch-kit/dashboard/`
3. If not found, tell the user to clone autoresearch-kit

## Step 3: Install dependencies if needed

Check if `node_modules` exists in the dashboard directory. If not:
```bash
cd <dashboard_dir> && npm install
```

## Step 4: Launch

Start the dev server with EXP_DIR pointing at the experiment:
```bash
cd <dashboard_dir> && EXP_DIR=<absolute_exp_dir> npm run dev &
```

Tell the user:
```
  Dashboard running at http://localhost:3000
  Pointing at: <exp_dir>

  Live mode is on — refreshes every 2 seconds.
  Press Ctrl+C in the terminal to stop.
```

</process>
