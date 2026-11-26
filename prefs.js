import Adw from 'gi://Adw';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import {createCommandGroup} from './prefs/commandGroup.js';
import {createIndicatorsGroup} from './prefs/indicatorsGroup.js';
import {createLanguageGroup} from './prefs/languageGroup.js';
import {getInstalledLayouts} from './prefs/installedLayouts.js';

export default class LayoutIndicatorPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        const page = new Adw.PreferencesPage();

        page.add(createIndicatorsGroup(settings));
        page.add(createCommandGroup(settings));

        for (const [layout, title] of getInstalledLayouts())
            page.add(createLanguageGroup(settings, layout, title));

        window.add(page);
    }
}
