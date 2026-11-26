import Gio from 'gi://Gio';

const ACCENT_KEY = 'accent-color';

export class AccentColor {
    constructor() {
        this._interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
        this._overridden = false;
        this._originalValue = null;
    }

    update(settings, style) {
        if (!settings.get_boolean('enable-accent-color')) {
            this._restore();
            return;
        }

        if (!this._overridden) {
            this._originalValue = this._interfaceSettings.get_user_value(ACCENT_KEY);
            this._overridden = true;
        }

        if (this._interfaceSettings.get_string(ACCENT_KEY) !== style.accent)
            this._interfaceSettings.set_string(ACCENT_KEY, style.accent);
    }

    destroy() {
        this._restore();
        this._interfaceSettings = null;
    }

    _restore() {
        if (!this._overridden)
            return;

        if (this._originalValue)
            this._interfaceSettings.set_value(ACCENT_KEY, this._originalValue);
        else
            this._interfaceSettings.reset(ACCENT_KEY);

        this._originalValue = null;
        this._overridden = false;
    }
}
