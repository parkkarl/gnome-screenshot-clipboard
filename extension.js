import Shell from 'gi://Shell';
import St from 'gi://St';
import GdkPixbuf from 'gi://GdkPixbuf';
import Meta from 'gi://Meta';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as Screenshot from 'resource:///org/gnome/shell/ui/screenshot.js';

export default class ScreenshotClipboardExtension extends Extension {
    enable() {
        this._settings = this.getSettings();

        // Remove built-in screenshot UI keybinding to free up PrintScreen
        try {
            Main.wm.removeKeybinding('show-screenshot-ui');
            this._removedBuiltinBinding = true;
        } catch (e) {
            this._removedBuiltinBinding = false;
        }

        Main.wm.addKeybinding(
            'area-screenshot',
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            this._onAreaScreenshot.bind(this)
        );

        Main.wm.addKeybinding(
            'fullscreen-screenshot',
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            this._onFullScreenshot.bind(this)
        );
    }

    disable() {
        Main.wm.removeKeybinding('area-screenshot');
        Main.wm.removeKeybinding('fullscreen-screenshot');

        // Restore built-in screenshot UI keybinding
        if (this._removedBuiltinBinding) {
            try {
                Main.wm.addKeybinding(
                    'show-screenshot-ui',
                    new Gio.Settings({schema_id: 'org.gnome.shell.keybindings'}),
                    Meta.KeyBindingFlags.NONE,
                    Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
                    () => Screenshot.showScreenshotUI()
                );
            } catch (e) {
                logError(e, 'ScreenshotClipboard: failed to restore built-in binding');
            }
            this._removedBuiltinBinding = false;
        }

        this._settings = null;
    }

    async _onAreaScreenshot() {
        try {
            const selector = new Screenshot.SelectArea();
            const rect = await selector.selectAsync();

            const screenshot = new Shell.Screenshot();
            const stream = Gio.MemoryOutputStream.new_resizable();
            await screenshot.screenshot_area(
                rect.x, rect.y, rect.width, rect.height, stream);
            stream.close(null);

            const bytes = stream.steal_as_bytes();

            // Downscale from physical to logical resolution so the
            // pasted image matches the on-screen selection size
            const loader = GdkPixbuf.PixbufLoader.new();
            loader.write_bytes(bytes);
            loader.close();
            const pixbuf = loader.get_pixbuf();

            let clipboardBytes = bytes;
            if (pixbuf.get_width() !== rect.width || pixbuf.get_height() !== rect.height) {
                const scaled = pixbuf.scale_simple(
                    rect.width, rect.height, GdkPixbuf.InterpType.BILINEAR);
                const [, buf] = scaled.save_to_bufferv('png', [], []);
                clipboardBytes = GLib.Bytes.new(buf);
            }

            const clipboard = St.Clipboard.get_default();
            clipboard.set_content(
                St.ClipboardType.CLIPBOARD, 'image/png', clipboardBytes);
        } catch (e) {
            if (!e.message?.includes('cancelled'))
                logError(e, 'ScreenshotClipboard: area screenshot failed');
        }
    }

    async _onFullScreenshot() {
        try {
            const screenshot = new Shell.Screenshot();
            const [content, scale = 1] = await screenshot.screenshot_stage_to_content();
            const texture = content.get_texture();

            await Screenshot.captureScreenshot(texture, null, scale, null);
        } catch (e) {
            logError(e, 'ScreenshotClipboard: fullscreen screenshot failed');
        }
    }
}
