import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

const BORDER_SIDES = [
    {key: 'border-top', title: 'Top'},
    {key: 'border-bottom', title: 'Bottom'},
    {key: 'border-left', title: 'Left'},
    {key: 'border-right', title: 'Right'},
];

function bindSwitch(settings, key, row) {
    settings.bind(key, row, 'active', Gio.SettingsBindFlags.DEFAULT);
    return row;
}

function bindSensitive(settings, key, row) {
    settings.bind(key, row, 'sensitive', Gio.SettingsBindFlags.GET);
    return row;
}

function createWidthRow(settings, key, title, subtitle, upper) {
    const row = new Adw.SpinRow({
        title,
        subtitle,
        adjustment: new Gtk.Adjustment({lower: 1, upper, step_increment: 1}),
    });
    settings.bind(key, row, 'value', Gio.SettingsBindFlags.DEFAULT);
    return row;
}

function describeBorderSides(enabledSides) {
    if (enabledSides.length === BORDER_SIDES.length)
        return 'All sides';
    if (enabledSides.length === 0)
        return 'None selected';
    return enabledSides.map(side => side.title).join(' + ');
}

function createBorderSidesRow(settings) {
    const expander = new Adw.ExpanderRow({title: 'Screen Border Sides', expanded: true});
    const allSidesRow = new Adw.SwitchRow({title: 'All Sides', subtitle: 'Toggle all four edges at once'});
    expander.add_row(allSidesRow);

    const getEnabledSides = () => BORDER_SIDES.filter(side => settings.get_boolean(side.key));

    const syncAllSidesRow = () => {
        const enabledSides = getEnabledSides();
        allSidesRow.active = enabledSides.length === BORDER_SIDES.length;
        expander.subtitle = describeBorderSides(enabledSides);
    };

    for (const side of BORDER_SIDES) {
        const row = bindSwitch(settings, side.key, new Adw.SwitchRow({title: side.title}));
        row.connect('notify::active', syncAllSidesRow);
        expander.add_row(row);
    }

    allSidesRow.connect('notify::active', () => {
        const active = allSidesRow.active;
        if (active === (getEnabledSides().length === BORDER_SIDES.length))
            return;

        for (const side of BORDER_SIDES)
            settings.set_boolean(side.key, active);
    });

    syncAllSidesRow();
    return expander;
}

export function createIndicatorsGroup(settings) {
    const group = new Adw.PreferencesGroup({
        title: 'Visual Indicators',
        description: 'Enable or disable indicator types and adjust their size',
    });

    group.add(bindSwitch(settings, 'enable-screen-border', new Adw.SwitchRow({
        title: 'Screen Border',
        subtitle: 'Show a colored border around all connected monitors',
    })));
    group.add(bindSensitive(settings, 'enable-screen-border', createBorderSidesRow(settings)));
    group.add(bindSensitive(settings, 'enable-screen-border', createWidthRow(settings, 'screen-border-width',
        'Screen Border Width (px)', 'Thickness of the border around displays', 15)));

    group.add(bindSwitch(settings, 'enable-panel-bar', new Adw.SwitchRow({
        title: 'Top Bar Bottom Line',
        subtitle: 'Show a colored line along the bottom edge of the top bar',
    })));
    group.add(bindSensitive(settings, 'enable-panel-bar', createWidthRow(settings, 'panel-bar-width',
        'Top Bar Line Width (px)', 'Thickness of the line under the top bar', 10)));

    group.add(bindSwitch(settings, 'enable-accent-color', new Adw.SwitchRow({
        title: 'System Accent Color',
        subtitle: 'Switch the GNOME accent color per layout',
    })));

    return group;
}
