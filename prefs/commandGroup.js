import Adw from 'gi://Adw';
import Gio from 'gi://Gio';

export function createCommandGroup(settings) {
    const group = new Adw.PreferencesGroup({
        title: 'Layout Change Command',
        description: 'Run a command every time the layout changes. ' +
            '${layout} is replaced with the layout code (e.g. US), ${body} with a JSON payload (e.g. {"value":"US"}). ' +
            'The command is not run through a shell, so pipes and redirections are not supported.\n' +
            'Example: curl -s -X POST http://127.0.0.1:8765/api/push/my-value -H "Content-Type: application/json" -d ${body}',
    });

    const enableRow = new Adw.SwitchRow({title: 'Run Command on Layout Switch'});
    settings.bind('enable-custom-command', enableRow, 'active', Gio.SettingsBindFlags.DEFAULT);
    group.add(enableRow);

    const commandRow = new Adw.EntryRow({title: 'Command'});
    settings.bind('custom-command', commandRow, 'text', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('enable-custom-command', commandRow, 'sensitive', Gio.SettingsBindFlags.GET);
    group.add(commandRow);

    return group;
}
