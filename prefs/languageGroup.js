import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import Gtk from 'gi://Gtk';

import {getLanguageStyle, updateLanguageStyle} from '../shared/languageStyles.js';

const ACCENT_COLORS = [
    {id: 'blue', title: 'Blue'},
    {id: 'teal', title: 'Teal'},
    {id: 'green', title: 'Green'},
    {id: 'yellow', title: 'Yellow'},
    {id: 'orange', title: 'Orange'},
    {id: 'red', title: 'Red'},
    {id: 'pink', title: 'Pink'},
    {id: 'purple', title: 'Purple'},
    {id: 'slate', title: 'Slate'},
];

function createAccentRow(settings, layout, accent) {
    const row = new Adw.ComboRow({
        title: 'System Accent Color',
        model: Gtk.StringList.new(ACCENT_COLORS.map(color => color.title)),
    });
    row.selected = Math.max(0, ACCENT_COLORS.findIndex(color => color.id === accent));

    row.connect('notify::selected', () => {
        updateLanguageStyle(settings, layout, {accent: ACCENT_COLORS[row.selected].id});
    });

    return row;
}

function createColorRow(settings, layout, styleKey, color, title, subtitle) {
    const rgba = new Gdk.RGBA();
    rgba.parse(color);

    const button = new Gtk.ColorDialogButton({
        dialog: new Gtk.ColorDialog({with_alpha: true, title: `${layout} — ${title}`}),
        rgba,
        valign: Gtk.Align.CENTER,
    });
    button.connect('notify::rgba', () => {
        updateLanguageStyle(settings, layout, {[styleKey]: button.rgba.to_string()});
    });

    const row = new Adw.ActionRow({title, subtitle, activatable_widget: button});
    row.add_suffix(button);
    return row;
}

export function createLanguageGroup(settings, layout, title) {
    const style = getLanguageStyle(settings, layout);
    const group = new Adw.PreferencesGroup({
        title,
        description: `Indicator colors for the ${layout} layout. They are kept if the layout is removed.`,
    });

    group.add(createAccentRow(settings, layout, style.accent));
    group.add(createColorRow(settings, layout, 'borderColor', style.borderColor,
        'Screen Border Color', 'Color and opacity of the border around displays'));
    group.add(createColorRow(settings, layout, 'panelColor', style.panelColor,
        'Top Bar Line Color', 'Color and opacity of the line under the top bar'));

    return group;
}
