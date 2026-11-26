import * as Keyboard from 'resource:///org/gnome/shell/ui/status/keyboard.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

import {AccentColor} from './lib/accentColor.js';
import {exportLayout} from './lib/layoutExport.js';
import {PanelBar} from './lib/panelBar.js';
import {ScreenBorders} from './lib/screenBorders.js';
import {getLanguageStyle, normalizeLayoutId} from './shared/languageStyles.js';

export default class LayoutIndicatorExtension extends Extension {
    enable() {
        this._layout = null;
        this._settings = this.getSettings();
        this._indicators = [new PanelBar(), new ScreenBorders(), new AccentColor()];

        this._settingsChangedId = this._settings.connect('changed', () => this._updateIndicators());

        this._inputSourceManager = Keyboard.getInputSourceManager();
        this._sourceChangedId = this._inputSourceManager.connect('current-source-changed', () => this._onSourceChanged());

        this._onSourceChanged();
    }

    disable() {
        this._inputSourceManager.disconnect(this._sourceChangedId);
        this._inputSourceManager = null;

        this._settings.disconnect(this._settingsChangedId);
        this._settings = null;

        for (const indicator of this._indicators)
            indicator.destroy();
        this._indicators = null;

        this._layout = null;
    }

    _onSourceChanged() {
        const source = this._inputSourceManager.currentSource;
        if (!source)
            return;

        const layout = normalizeLayoutId(source.id);
        if (layout === this._layout)
            return;

        this._layout = layout;
        this._updateIndicators();
        exportLayout(this._settings, layout);
    }

    _updateIndicators() {
        if (!this._layout)
            return;

        const style = getLanguageStyle(this._settings, this._layout);
        for (const indicator of this._indicators)
            indicator.update(this._settings, style);
    }
}
