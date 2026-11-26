const DEFAULT_STYLES = [
    {accent: 'blue', borderColor: 'rgba(107, 154, 196, 0.75)', panelColor: 'rgba(107, 154, 196, 0.90)'},
    {accent: 'orange', borderColor: 'rgba(217, 138, 95, 0.75)', panelColor: 'rgba(217, 138, 95, 0.90)'},
    {accent: 'yellow', borderColor: 'rgba(212, 184, 106, 0.75)', panelColor: 'rgba(212, 184, 106, 0.90)'},
    {accent: 'teal', borderColor: 'rgba(94, 168, 160, 0.75)', panelColor: 'rgba(94, 168, 160, 0.90)'},
    {accent: 'purple', borderColor: 'rgba(155, 132, 194, 0.75)', panelColor: 'rgba(155, 132, 194, 0.90)'},
    {accent: 'green', borderColor: 'rgba(116, 173, 123, 0.75)', panelColor: 'rgba(116, 173, 123, 0.90)'},
    {accent: 'pink', borderColor: 'rgba(207, 128, 156, 0.75)', panelColor: 'rgba(207, 128, 156, 0.90)'},
    {accent: 'slate', borderColor: 'rgba(130, 145, 163, 0.75)', panelColor: 'rgba(130, 145, 163, 0.90)'},
];

export function normalizeLayoutId(id) {
    return id.toUpperCase();
}

function readStyles(settings) {
    try {
        return JSON.parse(settings.get_string('language-configs'));
    } catch (error) {
        console.warn(`Layout Indicator: resetting invalid language-configs: ${error.message}`);
        return {};
    }
}

export function getLanguageStyle(settings, layout) {
    const styles = readStyles(settings);
    if (!styles[layout]) {
        styles[layout] = {...DEFAULT_STYLES[Object.keys(styles).length % DEFAULT_STYLES.length]};
        settings.set_string('language-configs', JSON.stringify(styles));
    }
    return styles[layout];
}

export function updateLanguageStyle(settings, layout, changes) {
    const styles = readStyles(settings);
    styles[layout] = {...styles[layout], ...changes};
    settings.set_string('language-configs', JSON.stringify(styles));
}
