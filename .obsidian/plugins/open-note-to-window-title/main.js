'use strict';

var obsidian = require('obsidian');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

class ActiveNoteTitlePlugin extends obsidian.Plugin {
    constructor() {
        super(...arguments);
        // Get the window title
        this.baseTitle = document.title;
        // Debounced refreshTitle
        this.debouncedRefreshTitle = obsidian.debounce((file) => {
            this.refreshTitle(file);
        }, 500, false);
        this.handleRename = (file, oldPath) => __awaiter(this, void 0, void 0, function* () {
            // console.log(`file: ${oldPath} renamed to: ${file.path}`);
            if (file instanceof obsidian.TFile && file === this.app.workspace.getActiveFile()) {
                this.app.metadataCache.onCleanCache(() => { this.refreshTitle(file); });
            }
        });
        this.handleDelete = (file) => __awaiter(this, void 0, void 0, function* () {
            this.refreshTitle();
        });
        this.handleOpen = (file) => __awaiter(this, void 0, void 0, function* () {
            if (file instanceof obsidian.TFile && file === this.app.workspace.getActiveFile()) {
                this.debouncedRefreshTitle(file);
            }
        });
        this.handleLeafChange = (leaf) => __awaiter(this, void 0, void 0, function* () {
            this.debouncedRefreshTitle();
        });
        this.handleMetaChange = (file) => __awaiter(this, void 0, void 0, function* () {
            if (file instanceof obsidian.TFile && file === this.app.workspace.getActiveFile()) {
                this.refreshTitle(file);
            }
        });
        this.handleMetaResolve = (file) => __awaiter(this, void 0, void 0, function* () {
            if (file instanceof obsidian.TFile && file === this.app.workspace.getActiveFile()) {
                this.refreshTitle(file);
            }
        });
    }
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            // Show the plugin is loading for developers
            console.log(`loading ${this.manifest.id} plugin`);
            // parse the version from the original title string
            if (this.baseTitle == '' || this.baseTitle == undefined) {
                console.log('baseTitle is unset');
                this.baseTitle = 'Obsidian';
            }
            const m = this.baseTitle.match(/v([0-9.]+)$/);
            this.appVer = m[m.length - 1] || '';
            //console.log(`appVer set to [${this.appVer}]`);
            // Load the settings
            yield this.loadSettings();
            // Add the settings tab
            this.addSettingTab(new ActiveNoteTitlePluginSettingsTab(this.app, this));
            // Set up initial title change
            this.app.workspace.onLayoutReady(this.initialize.bind(this));
            this.refreshTitle();
            //this.app.metadataCache.onCleanCache(this.handleMeta.bind(this));
        });
    }
    initialize() {
        // console.log('registering callbacks');
        // When opening, renaming, or deleting a file, update the window title
        this.registerEvent(this.app.workspace.on('file-open', this.handleOpen));
        this.registerEvent(this.app.workspace.on('active-leaf-change', this.handleLeafChange));
        this.registerEvent(this.app.vault.on('rename', this.handleRename));
        this.registerEvent(this.app.vault.on('delete', this.handleDelete));
        this.registerEvent(this.app.metadataCache.on('changed', this.handleMetaChange));
        //this.registerEvent(this.app.metadataCache.on('resolve', this.handleMetaResolve));
    }
    // Restore original title on unload.
    onunload() {
        console.log(`unloading ${this.manifest.id} plugin`);
        //console.log(`reverting title to '${this.baseTitle}'`);
        document.title = this.baseTitle;
    }
    // The main method that is responsible for updating the title
    refreshTitle(file) {
        let template;
        // For the template, the vault and workspace are always available
        template = {
            'vault': this.app.vault.getName(),
            'version': (this.appVer || ''),
            'workspace': this.app.internalPlugins.plugins.workspaces.instance.activeWorkspace // Defaults to: '' if not enabled
        };
        if (file && file instanceof obsidian.TFile) {
            // If a file is open, the filename, path and frontmatter is added
            let friendlyBasename = file.basename;
            if (file.extension !== 'md') {
                friendlyBasename = file.name;
            }
            template = Object.assign({ 'parentpath': (file.parent ? (file.parent).path : ''), 'filepath': file.path, 'filename': file.name, 'basename': friendlyBasename, 'extension': file.extension }, template);
            let cache = this.app.metadataCache.getFileCache(file);
            if (cache && cache.frontmatter) {
                const isTemplate = new RegExp('<%');
                for (const [frontmatterKey, frontmatterValue] of Object.entries(cache.frontmatter || {})) {
                    let k = ('frontmatter.' + frontmatterKey);
                    if (!isTemplate.test(frontmatterValue)) {
                        template[k] = frontmatterValue;
                    }
                }
            }
            //console.log(template)
            document.title = this.templateTitle(template, this.settings.titleTemplate);
        }
        else {
            document.title = this.templateTitle(template, this.settings.titleTemplateEmpty);
        }
    }
    templateTitle(template, title) {
        let delimStr = this.settings.delimStr;
        let titleSeparator = this.settings.titleSeparator;
        if (this.settings.overrideYamlField !== null && this.settings.overrideYamlField.length > 0) {
            let titleOverride = String('frontmatter.' + this.settings.overrideYamlField);
            if (template[titleOverride]) {
                // console.log('override title: %s', template[titleOverride]);
                return template[titleOverride];
            }
        }
        // Process each template key
        Object.keys(template).forEach(field => {
            const hasField = new RegExp(`{{${field}}}`);
            //console.log(`%cchecking if ${title} contains {{${field}}}`, 'background: #222; color: #a0ffff');
            //console.log('bool: ' + hasField.test(title));
            //console.log('type of field: ' + typeof(field));
            //console.log(`val: [${template[field]}]`);
            if (hasField.test(title) && template[field] !== null && String(template[field]).length > 0) {
                //console.log(`%cexecuting transforms: [${field}] --> [${template[field]}]`, 'background: #222; color: #bada55');
                let re = new RegExp(`{{${field}}}`);
                title = title.replace(re, `${template[field]}`);
            }
        });
        // clean up delimiters
        let re = /([(]+)?{{[^}]+}}([)]+)?/g;
        title = title.replace(re, '');
        // clean up delimiters
        const replacements = new Map([
            [`^${delimStr}`, ''],
            [`${delimStr}+`, delimStr],
            [`${delimStr}(?!\ )`, titleSeparator],
            [`(?<!\ )${delimStr}`, ''],
        ]);
        for (const [key, value] of replacements) {
            let re = new RegExp(key, 'g');
            title = title.replace(re, value);
        }
        return title;
    }
    ;
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
        });
    }
}
const DEFAULT_SETTINGS = {
    titleTemplate: "{{basename}}~~{{vault}} - Obsidian v{{version}}",
    titleTemplateEmpty: "{{vault}} - Obsidian v{{version}}",
    titleSeparator: " - ",
    delimStr: "~~",
    overrideYamlField: "title"
};
class ActiveNoteTitlePluginSettingsTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        let { containerEl } = this;
        let desc;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Window title templates' });
        containerEl.createEl('p', { text: 'These two templates override the window title of the Obsidian window. This is useful for example when you use tracking software that works with window titles. You can use the format `~~{{placeholder}}~~` if you want the placeholder to be completely omitted when blank, otherwise whitespace and other characters will be preserved. You can surround a placeholder with parentheses e.g. `({{frontmatter.project}})` and it will be hidden if the referenced field is empty.' });
        desc = document.createDocumentFragment();
        desc.append('Available ');
        desc.createEl('b').innerText = 'placeholders:';
        let placeholders = [
            ["vault", "workspace", "version"],
            ["filename", "filepath", "parentpath", "basename", "extension"],
            ["frontmatter.<any_frontmatter_key>"]
        ];
        placeholders.forEach(row => {
            desc.createEl("br");
            row.forEach(key => {
                desc.append(`{{${key}}} `);
            });
        });
        new obsidian.Setting(containerEl)
            .setName('Default Template')
            .setDesc(desc)
            .addText(text => {
            text.inputEl.style.fontFamily = 'monospace';
            text.inputEl.style.width = '500px';
            text.inputEl.style.height = '46px';
            text
                .setPlaceholder(DEFAULT_SETTINGS.titleTemplate)
                .setValue(this.plugin.settings.titleTemplate)
                .onChange((value) => {
                this.plugin.settings.titleTemplate = value;
                this.plugin.saveData(this.plugin.settings);
                this.plugin.refreshTitle();
            });
        });
        new obsidian.Setting(containerEl)
            .setName('YAML Frontmatter Title Override Field')
            .setDesc('If this frontmatter field is present, use its value as the title instead of dynamically calculating it.')
            .addText(text => {
            text.inputEl.style.fontFamily = 'monospace';
            text.inputEl.style.width = '500px';
            text.inputEl.style.height = '46px';
            text
                .setPlaceholder(DEFAULT_SETTINGS.overrideYamlField)
                .setValue(this.plugin.settings.overrideYamlField)
                .onChange((value) => {
                this.plugin.settings.overrideYamlField = value;
                this.plugin.saveData(this.plugin.settings);
                this.plugin.refreshTitle();
            });
        });
        desc = document.createDocumentFragment();
        desc.append('Available ');
        desc.createEl('b').innerText = 'placeholders:';
        placeholders = [
            ["vault", "workspace", "version"],
        ];
        placeholders.forEach(key => {
            desc.createEl("br");
            desc.append(`{{${key}}}`);
        });
        new obsidian.Setting(containerEl)
            .setName('Template for when no file is open')
            .setDesc(desc)
            .addText(text => {
            text.inputEl.style.fontFamily = 'monospace';
            text.inputEl.style.width = '500px';
            text.inputEl.style.height = '46px';
            text
                .setPlaceholder(DEFAULT_SETTINGS.titleTemplateEmpty)
                .setValue(this.plugin.settings.titleTemplateEmpty)
                .onChange((value) => {
                this.plugin.settings.titleTemplateEmpty = value;
                this.plugin.saveData(this.plugin.settings);
                this.plugin.refreshTitle();
            });
        });
        new obsidian.Setting(containerEl)
            .setName('Separator to insert between placeholder elements')
            .setDesc('Replaces delimiter string between placeholders that are not null.')
            .addText(text => {
            text.inputEl.style.fontFamily = 'monospace';
            text.inputEl.style.width = '142px';
            text.inputEl.style.height = '46px';
            text
                .setPlaceholder(' - ')
                .setValue(this.plugin.settings.titleSeparator)
                .onChange((value) => {
                this.plugin.settings.titleSeparator = value;
                this.plugin.saveData(this.plugin.settings);
                this.plugin.refreshTitle();
            });
        });
        new obsidian.Setting(containerEl)
            .setName('Delimiter string')
            .setDesc('Select a string to be used to mark locations for separators to be inserted.')
            .addDropdown((dropdown) => {
            dropdown.addOption('~~', '~~ (Tilde)');
            dropdown.addOption('##', '## (Hash)');
            dropdown.addOption('__', '__ (Underscore)');
            dropdown.setValue(this.plugin.settings.delimStr);
            dropdown.onChange((option) => {
                this.plugin.settings.delimStr = option;
                this.plugin.saveData(this.plugin.settings);
                this.plugin.refreshTitle();
            });
        });
    }
}

module.exports = ActiveNoteTitlePlugin;


/* nosourcemap */