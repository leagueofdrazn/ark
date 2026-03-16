#!/bin/sh
set -e

ARK_REPO="https://github.com/leagueofdrazn/ark.git"
ARK_DIR="$HOME/.ark"

echo ""
echo "═══════════════════════════════════════════════════"
echo "  ARK — AutoResearch Kit"
echo "═══════════════════════════════════════════════════"
echo ""

# Clone or update
if [ -d "$ARK_DIR" ]; then
  BEFORE=$(git -C "$ARK_DIR" rev-parse HEAD 2>/dev/null)
  git -C "$ARK_DIR" pull --quiet
  AFTER=$(git -C "$ARK_DIR" rev-parse HEAD 2>/dev/null)
  if [ "$BEFORE" = "$AFTER" ]; then
    echo "  Already on the latest version!"
    echo ""
    exit 0
  fi
  echo "  Updated to latest version..."
else
  echo "  Downloading ARK..."
  git clone --quiet "$ARK_REPO" "$ARK_DIR"
fi

# Detect available runtimes
INSTALLED=""

# Claude Code
if [ -d "$HOME/.claude" ]; then
  echo "  Installing for Claude Code..."
  mkdir -p "$HOME/.claude/commands"
  rm -rf "$HOME/.claude/commands/ark"
  cp -r "$ARK_DIR/commands/ark" "$HOME/.claude/commands/ark"
  INSTALLED="$INSTALLED claude"
fi

# Gemini
if command -v gemini >/dev/null 2>&1 || [ -d "$HOME/.gemini" ]; then
  echo "  Installing for Gemini..."
  mkdir -p "$HOME/.gemini/commands"
  rm -rf "$HOME/.gemini/commands/ark"
  cp -r "$ARK_DIR/commands/ark" "$HOME/.gemini/commands/ark"
  INSTALLED="$INSTALLED gemini"
fi

# Codex
if [ -d "$HOME/.codex" ]; then
  echo "  Installing for Codex..."
  mkdir -p "$HOME/.codex/skills"
  for cmd in "$ARK_DIR"/commands/ark/*.md; do
    name=$(basename "$cmd" .md)
    skill_dir="$HOME/.codex/skills/ark-$name"
    mkdir -p "$skill_dir"
    cp "$cmd" "$skill_dir/SKILL.md"
  done
  INSTALLED="$INSTALLED codex"
fi

# Copilot (uses same path as Claude Code — shared command system)
# No separate install needed if Claude Code is installed

# Install dashboard dependencies
if command -v npm >/dev/null 2>&1; then
  if [ ! -d "$ARK_DIR/dashboard/node_modules" ]; then
    echo "  Installing dashboard dependencies..."
    cd "$ARK_DIR/dashboard" && npm install --silent 2>/dev/null
  fi
else
  echo "  Note: npm not found — install Node.js 18+ to use /ark:dashboard"
fi

echo ""
if [ -z "$INSTALLED" ]; then
  echo "  No supported runtime found. Install one of:"
  echo "    Claude Code:  https://claude.com/claude-code"
  echo "    Gemini CLI:   https://github.com/google-gemini/gemini-cli"
  echo "    Codex CLI:    https://github.com/openai/codex"
  echo ""
  echo "  Then re-run this installer."
else
  echo "  Done! ARK installed for:$INSTALLED"
  echo ""
  echo "  To get started, open any of these in a project directory:"
  echo ""
  [ -n "$(echo "$INSTALLED" | grep claude)" ] && echo "    claude --dangerously-skip-permissions"
  [ -n "$(echo "$INSTALLED" | grep gemini)" ] && echo "    gemini --yolo"
  [ -n "$(echo "$INSTALLED" | grep codex)" ] &&  echo "    codex --full-auto"
  echo ""
  echo "  Then type:  /ark:new"
  echo ""
fi
