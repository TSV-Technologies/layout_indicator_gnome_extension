import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export class PanelBar {
    constructor() {
        this._originalStyle = Main.panel.get_style();
    }

    update(settings, style) {
        if (!settings.get_boolean('enable-panel-bar')) {
            Main.panel.set_style(this._originalStyle);
            return;
        }

        const width = settings.get_int('panel-bar-width');
        const lineStyle = `box-shadow: inset 0 -${width}px 0 0 ${style.panelColor};`;
        Main.panel.set_style(this._originalStyle ? `${this._originalStyle} ${lineStyle}` : lineStyle);
    }

    destroy() {
        Main.panel.set_style(this._originalStyle);
        this._originalStyle = null;
    }
}
