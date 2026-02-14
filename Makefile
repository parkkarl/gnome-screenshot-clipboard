UUID = screenshot-clipboard@local
EXT_DIR = $(HOME)/.local/share/gnome-shell/extensions/$(UUID)

.PHONY: build install uninstall pack clean

build:
	glib-compile-schemas schemas/

install: build
	@bash install.sh

uninstall:
	@bash uninstall.sh

pack: build
	@rm -f $(UUID).shell-extension.zip
	zip $(UUID).shell-extension.zip \
		extension.js \
		metadata.json \
		schemas/org.gnome.shell.extensions.screenshot-clipboard.gschema.xml \
		schemas/gschemas.compiled
	@echo "Created $(UUID).shell-extension.zip"

clean:
	rm -f schemas/gschemas.compiled
	rm -f $(UUID).shell-extension.zip
