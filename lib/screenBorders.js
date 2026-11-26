import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const SIDES = ['top', 'right', 'bottom', 'left'];

function buildBorderStyle(settings, color) {
    const width = settings.get_int('screen-border-width');
    const enabledSides = SIDES.filter(side => settings.get_boolean(`border-${side}`));
    if (enabledSides.length === 0)
        return null;

    const sideWidths = SIDES.map(side => `border-${side}-width: ${enabledSides.includes(side) ? width : 0}px;`);
    return `${sideWidths.join(' ')} border-style: solid; border-color: ${color};`;
}

export class ScreenBorders {
    constructor() {
        this._style = null;
        this._widgets = [];

        this._monitorsChangedId = Main.layoutManager.connect('monitors-changed', () => this._createWidgets());
        this._createWidgets();
    }

    update(settings, style) {
        this._style = settings.get_boolean('enable-screen-border')
            ? buildBorderStyle(settings, style.borderColor)
            : null;

        for (const widget of this._widgets)
            this._applyStyle(widget);
    }

    destroy() {
        Main.layoutManager.disconnect(this._monitorsChangedId);
        this._destroyWidgets();
        this._style = null;
    }

    _createWidgets() {
        this._destroyWidgets();

        for (const {x, y, width, height} of Main.layoutManager.monitors) {
            const widget = new St.Widget({x, y, width, height, reactive: false});
            this._applyStyle(widget);
            Main.uiGroup.add_child(widget);
            this._widgets.push(widget);
        }
    }

    _applyStyle(widget) {
        widget.set_style(this._style);
        widget.visible = this._style !== null;
    }

    _destroyWidgets() {
        for (const widget of this._widgets)
            widget.destroy();
        this._widgets = [];
    }
}
