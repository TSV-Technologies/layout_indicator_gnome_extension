import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

function writeLayoutFile(layout) {
    const path = GLib.build_filenamev([GLib.get_user_runtime_dir(), 'layout-indicator']);

    try {
        GLib.file_set_contents(path, `${layout}\n`);
    } catch (error) {
        console.error(`Layout Indicator: cannot write ${path}: ${error.message}`);
    }
}

function runLayoutCommand(settings, layout) {
    if (!settings.get_boolean('enable-custom-command'))
        return;

    const commandLine = settings.get_string('custom-command').trim();
    if (!commandLine)
        return;

    const body = JSON.stringify({value: layout});

    try {
        const [, argv] = GLib.shell_parse_argv(commandLine);
        const args = argv.map(arg => arg
            .replace(/\$\{body\}/g, () => body)
            .replace(/\$\{layout\}/g, () => layout));

        Gio.Subprocess.new(args, Gio.SubprocessFlags.STDOUT_SILENCE | Gio.SubprocessFlags.STDERR_SILENCE);
    } catch (error) {
        console.error(`Layout Indicator: cannot run layout command: ${error.message}`);
    }
}

export function exportLayout(settings, layout) {
    writeLayoutFile(layout);
    runLayoutCommand(settings, layout);
}
