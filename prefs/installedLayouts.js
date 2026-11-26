import Gio from 'gi://Gio';

import {normalizeLayoutId} from '../shared/languageStyles.js';

let GnomeDesktop = null;
try {
    ({default: GnomeDesktop} = await import('gi://GnomeDesktop?version=4.0'));
} catch {
    // The GnomeDesktop typelib is a separate package on some distributions,
    // without it layouts are shown by their ids only.
}

export function getInstalledLayouts() {
    const inputSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.input-sources'});
    const xkbInfo = GnomeDesktop ? new GnomeDesktop.XkbInfo() : null;
    const layouts = new Map();

    for (const [type, id] of inputSettings.get_value('sources').deepUnpack()) {
        const layout = normalizeLayoutId(id);
        if (layouts.has(layout))
            continue;

        let title = layout;
        if (xkbInfo && type === 'xkb') {
            const [found, displayName] = xkbInfo.get_layout_info(id);
            if (found)
                title = `${layout} — ${displayName}`;
        }

        layouts.set(layout, title);
    }

    return layouts;
}
