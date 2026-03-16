#!/bin/sh
set -e

ARK_REPO="https://github.com/leagueofdrazn/ark.git"
ARK_DIR="$HOME/.ark"
COMMANDS_DIR="$HOME/.claude/commands/ark"

echo ""
echo "═══════════════════════════════════════════════════"
echo "  ARK — AutoResearch Kit"
echo "  Installing..."
echo "═══════════════════════════════════════════════════"
echo ""

# Clone or update
if [ -d "$ARK_DIR" ]; then
  echo "  Updating existing installation..."
  git -C "$ARK_DIR" pull --quiet
else
  echo "  Downloading ARK..."
  git clone --quiet "$ARK_REPO" "$ARK_DIR"
fi

# Install slash commands
echo "  Installing slash commands..."
mkdir -p "$HOME/.claude/commands"
rm -rf "$COMMANDS_DIR"
cp -r "$ARK_DIR/commands/ark" "$COMMANDS_DIR"

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
echo "  Done! ARK is installed."
echo ""
echo "  Open Claude Code in any project and run:"
echo "    /ark:new        — design your experiment"
echo "    /ark:help       — see all commands"
echo ""
