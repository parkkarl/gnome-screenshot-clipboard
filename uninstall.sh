#!/bin/bash
set -e

UUID="screenshot-clipboard@local"
EXT_DIR="$HOME/.local/share/gnome-shell/extensions/$UUID"

echo "Disabling extension..."
gnome-extensions disable "$UUID" 2>/dev/null || true

echo "Restoring built-in screenshot keybinding..."
gsettings reset org.gnome.shell.keybindings show-screenshot-ui

echo "Removing extension files..."
rm -rf "$EXT_DIR"

echo ""
echo "Done! Please log out and log back in for changes to take effect."
echo "Shift+Super+S will open the default GNOME screenshot UI again."
