# Layout Indicator (`layout-indicator@tsv-tech`)

**English** | [Русский](README.ru.md)

**Layout Indicator** is a GNOME Shell extension that shows the active keyboard layout at the edges of your screen. It can also pass every layout change to external tools through a file or a command you choose.

It reacts to the `current-source-changed` signal and never polls. It supports multiple monitors and keeps a separate color profile for each layout.

---

## Features

### 1. Three independent visual indicators

You can turn each indicator on or off in the preferences, and all of them update as soon as the layout changes.

* **Screen border (on by default)**
  * Draws a colored border on **all connected monitors**. Clicks pass through it (`reactive: false`).
  * Rebuilds itself when monitors are plugged in or unplugged, or when the resolution or scaling changes (`monitors-changed`).
  * **Edges:** all four sides (**All Sides**) or any combination of **Top**, **Bottom**, **Left** and **Right**.
  * **Width:** `1`–`15 px` (default `3 px`).

* **Top bar bottom line (optional)**
  * Draws a colored line along the bottom edge of the top bar using `box-shadow: inset`. The panel height stays the same and the icons do not move.
  * The panel's own inline style is kept and restored when the extension is disabled.
  * **Width:** `1`–`10 px` (default `2 px`).

* **System accent color (optional)**
  * Changes the GNOME accent color (`org.gnome.desktop.interface` → `accent-color`) to match the active layout.
  * Supports all 9 GNOME accent colors: Blue, Teal, Green, Yellow, Orange, Red, Pink, Purple and Slate.
  * When the extension is disabled, your original accent color comes back.

---

### 2. Per-layout color profiles

* **Only installed layouts are listed.** The preferences window reads `org.gnome.desktop.input-sources` and shows one card for each configured input source. When the optional `GnomeDesktop` 4.0 typelib is available, each card also shows the layout's full name (for example `US — English (US)`).
* **RGBA colors.** Every layout has its own color picker, with opacity, for the screen border and for the top bar line. It also has its own accent color drop-down.
* **Automatic palette.** A new layout gets the next preset from an 8-color pastel cycle: Blue → Orange → Yellow → Teal → Purple → Green → Pink → Slate.
* **Kept after removal.** Profiles are stored in GSettings (`language-configs`) as JSON, keyed by layout ID. If you remove a layout and add it back later, its colors come back too.

**Layout ID** is the input source ID in upper case:

| Input source                  | ID              |
|-------------------------------|-----------------|
| `xkb` `us`                    | `US`            |
| `xkb` `ua`                    | `UA`            |
| `xkb` `de+nodeadkeys`         | `DE+NODEADKEYS` |
| `ibus` `mozc-jp`              | `MOZC-JP`       |

Variants of the same layout (`us` and `us+dvorak`, for example) are treated as separate layouts and get separate colors.

---

### 3. Layout file and custom command

* **Layout file.** On every layout change, the layout ID (for example `US`) is written to `$XDG_RUNTIME_DIR/layout-indicator`, which is usually `/run/user/1000/layout-indicator`. The file belongs to your user only and is removed at logout. To read it:

  ```bash
  cat "$XDG_RUNTIME_DIR/layout-indicator"
  ```

* **Custom command (off by default).** You can run any command you like whenever the layout changes. It starts asynchronously through `Gio.Subprocess` and its output is discarded.
  * The command line is split into arguments like a shell command line, but **it is not run through a shell**. Pipes (`|`), redirections (`>`) and `&&` are not supported. If you need them, wrap the command in `sh -c '…'`.
  * **Placeholders.** These are replaced inside each argument, so you do not need to escape them:
    * `${layout}` is the layout ID, for example `US`.
    * `${body}` is a JSON payload, for example `{"value":"US"}`.
  * **Example (webhook / PhoneBox):**

    ```bash
    curl -s -X POST http://127.0.0.1:8765/api/push/my-value -H "Content-Type: application/json" -d ${body}
    ```

  * **Example with a shell:**

    ```bash
    sh -c 'echo ${layout} >> ~/layout-history.txt'
    ```

---

## Compatibility

* **GNOME Shell:** `47`, `48`, `49`, `50`. GNOME 46 is not supported because it has no `accent-color` key.
* **Display server:** Wayland. X11 also works on GNOME 47–48.
* **Dependencies:** standard GNOME Shell, GTK 4 and libadwaita libraries. `GnomeDesktop` 4.0 is optional and only provides full layout names. On Debian/Ubuntu it comes from the `gir1.2-gnomedesktop-4.0` package.

---

## Project structure

```text
layout-indicator@tsv-tech/
├── extension.js              # Entry point: enable()/disable(), reacts to layout changes
├── metadata.json             # Extension metadata
├── prefs.js                  # Entry point of the preferences window
├── lib/                      # GNOME Shell process only
│   ├── accentColor.js        # Accent color override and restore
│   ├── layoutExport.js       # Layout file and custom command
│   ├── panelBar.js           # Line under the top bar
│   └── screenBorders.js      # Borders on every monitor
├── prefs/                    # Preferences process only
│   ├── commandGroup.js       # "Layout Change Command" group
│   ├── indicatorsGroup.js    # "Visual Indicators" group
│   ├── installedLayouts.js   # List of installed input sources
│   └── languageGroup.js      # Per-layout color cards
├── shared/                   # Used by both processes, no UI imports
│   └── languageStyles.js     # Palette and reading/writing language-configs
└── schemas/
    └── org.gnome.shell.extensions.layout-indicator.gschema.xml
```

---

## Installation

### Option A: from a ZIP (recommended)

From the folder with the source files:

```bash
gnome-extensions pack --extra-source=lib --extra-source=prefs --extra-source=shared --force .
gnome-extensions install --force layout-indicator@tsv-tech.shell-extension.zip
```

`gnome-extensions pack` compiles the schema automatically.

### Option B: manual

1. Create the extension folder. Its name must match the `uuid` in `metadata.json`:

   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions/layout-indicator@tsv-tech
   ```

2. Copy everything from the project structure above into it: `extension.js`, `prefs.js`, `metadata.json` and the `lib/`, `prefs/`, `shared/` and `schemas/` folders.

3. Compile the schema:

   ```bash
   glib-compile-schemas ~/.local/share/gnome-shell/extensions/layout-indicator@tsv-tech/schemas/
   ```

### Then

1. **Restart GNOME Shell.**
   * Wayland: log out and log back in.
   * X11 (GNOME 47–48): press `Alt` + `F2`, type `r` and press `Enter`.

2. **Enable the extension:**

   ```bash
   gnome-extensions enable layout-indicator@tsv-tech
   ```

---

## Configuration

Open the preferences window:

```bash
gnome-extensions prefs layout-indicator@tsv-tech
```

Or click the settings button next to **Layout Indicator** in the Extensions app or in Extension Manager.

### Reset to defaults

This resets all preferences and all saved color profiles:

```bash
dconf reset -f /org/gnome/shell/extensions/layout-indicator/
```

---

## Upgrading from earlier versions

* The layout file moved from `/tmp/layout` to `$XDG_RUNTIME_DIR/layout-indicator`. Update any scripts and widgets that read it.
* The custom command is now **off by default** and its default text is empty. If you used the old default `curl …`, enter it again and turn on **Run Command on Layout Switch**.
* The old template with single quotes (`-d '${body}'`) still works.
* GNOME 46 is no longer supported.

---

## Troubleshooting

* **The extension is not listed by `gnome-extensions list`.** Check that the folder is named exactly `~/.local/share/gnome-shell/extensions/layout_indicator@tsv-tech`. On Wayland, also log out and back in.
* **The preferences window fails with a `schema_id` error.** Compile the schema again (step 3 of Option B), and check that `metadata.json` contains `"settings-schema": "org.gnome.shell.extensions.layout-indicator"`.
* **The command does not run.** Pipes and redirections need `sh -c '…'`, and the program must be in your `PATH`. Errors show up in the log.
* **Logs:**

  ```bash
  journalctl -f -o cat /usr/bin/gnome-shell | grep -i "layout indicator"
  ```

---

## License

Developed by TSV Technologies (https://tsv.pp.ua/).
