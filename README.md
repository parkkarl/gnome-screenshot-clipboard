# Screenshot to Clipboard — GNOME Shell Extension

Mac-like screenshot shortcuts for GNOME desktop:

- **Shift+Super+S** — draw a rectangle, area screenshot goes to clipboard
- **PrintScreen** — full screen screenshot goes to clipboard

Screenshots are also saved to `~/Pictures/Screenshots/`.

## Why an extension?

GNOME Shell 42+ restricts the D-Bus Screenshot service to allowlisted processes only. Regular scripts (`gdbus`, `grim`/`slurp`) don't work on Wayland. This extension runs inside GNOME Shell and has direct access to the internal screenshot API.

## Compatibility

| GNOME Shell | Tested |
|-------------|--------|
| 49          | Yes (Fedora 43) |
| 47, 48      | Should work |

Requires Wayland session. X11 not tested.

## Install

```bash
git clone https://github.com/markuspark/gnome-screenshot-clipboard.git
cd gnome-screenshot-clipboard
make install
```

Then **log out and log back in**.

### Manual install

```bash
glib-compile-schemas schemas/
mkdir -p ~/.local/share/gnome-shell/extensions/screenshot-clipboard@local/schemas
cp extension.js metadata.json ~/.local/share/gnome-shell/extensions/screenshot-clipboard@local/
cp schemas/*.xml schemas/gschemas.compiled ~/.local/share/gnome-shell/extensions/screenshot-clipboard@local/schemas/
gsettings set org.gnome.shell.keybindings show-screenshot-ui '[]'
gnome-extensions enable screenshot-clipboard@local
```

Log out and log back in.

## Uninstall

```bash
make uninstall
```

This restores the default GNOME screenshot keybinding. Log out and log back in.

## Troubleshooting

Watch GNOME Shell logs in real time:

```bash
journalctl /usr/bin/gnome-shell -f
```

Check extension status:

```bash
gnome-extensions info screenshot-clipboard@local
```

## License

MIT
