#!/bin/bash
set -e

UUID="screenshot-clipboard@local"
EXT_DIR="$HOME/.local/share/gnome-shell/extensions/$UUID"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Building schemas..."
glib-compile-schemas "$SCRIPT_DIR/schemas/"

echo "Installing extension to $EXT_DIR..."
mkdir -p "$EXT_DIR/schemas"
cp "$SCRIPT_DIR/extension.js" "$EXT_DIR/"
cp "$SCRIPT_DIR/metadata.json" "$EXT_DIR/"
cp "$SCRIPT_DIR/schemas/"*.xml "$EXT_DIR/schemas/"
cp "$SCRIPT_DIR/schemas/gschemas.compiled" "$EXT_DIR/schemas/"

echo "Disabling built-in screenshot keybinding..."
gsettings set org.gnome.shell.keybindings show-screenshot-ui '[]'

echo "Enabling extension..."
gnome-extensions enable "$UUID" 2>/dev/null || true

echo ""
echo "Done! Please log out and log back in for changes to take effect."
echo "  - Shift+Super+S  → area screenshot to clipboard"
echo "  - PrintScreen     → fullscreen screenshot to clipboard"
